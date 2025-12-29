import { PrismaClient } from "@prisma/client";
import { rankJobsWithLocation } from "~~/server/utils/ml-algorithms";
import { calculateDistance } from "~~/server/utils/geolocation";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();

  try {
    const userId = await checkAccessToken(event);

    if (!userId) {
      return createError({
        statusCode: 401,
        message: "Unauthorized"
      });
    }

    // Fetch user profile with skills, location, and application history
    const user = await prisma.user.findUnique({
      where: { user_id: userId as number },
      include: {
        userSkills: {
          include: {
            skill: true
          }
        },
        applications: {
          include: {
            job: true
          }
        }
      }
    });

    if (!user) {
      return createError({
        statusCode: 404,
        message: "User not found"
      });
    }

    // Extract features from user profile
    const userSkills = user.userSkills.map(us => us.skill.name);
    const userBio = user.bio || "";
    const userLocation = user.latitude && user.longitude
      ? { latitude: user.latitude, longitude: user.longitude }
      : null;

    // Extract features from past applications (jobs they've applied to)
    const appliedJobTexts = user.applications
      .map(app => `${app.job.title} ${app.job.description}`)
      .join(" ");

    // Get all available jobs (without status filter - let all jobs be considered)
    const jobs = await prisma.job.findMany({
      where: {
        status: {
          notIn: ['Completed', 'Closed']
        },
        NOT: {
          user_id: userId as number
        }
      }
    });

    // If no jobs found, return empty recommendations
    if (jobs.length === 0) {
      return {
        success: true,
        recommendations: [],
        totalMatches: 0,
        userProfile: {
          skills: userSkills,
          bio: userBio ? userBio.substring(0, 100) + "..." : "No bio",
          appliedJobsCount: user.applications.length,
          location: user.location
        },
        debug: {
          message: "No jobs available in the system",
          totalJobsInDb: 0
        },
        algorithm: {
          name: "Advanced TF-IDF with Cosine Similarity + Geolocation",
          considersHistory: true,
          weights: {
            skillMatch: 0.35,
            bioMatch: 0.2,
            pastJobsMatch: 0.15,
            distanceMatch: 0.3
          }
        }
      };
    }

    // Rank jobs with consideration for past applications AND location
    const rankedJobs = jobs.map(job => {
      const requiredSkills = job.requiredSkills
        ? job.requiredSkills.split("/").map(s => s.trim())
        : [];

      // Base similarity from current skills
      const skillStr = userSkills.join(" ");
      const requiredSkillStr = requiredSkills.join(" ");
      
      // Keyword-based matching (handles partial matches and related skills)
      const keywordSimilarity = calculateKeywordSimilarity(userSkills, requiredSkills);
      
      // TF-IDF based matching
      const tfidfSimilarity = textSimilarity(skillStr, requiredSkillStr);
      
      // Use the higher of the two for skill matching
      const skillSimilarity = Math.max(keywordSimilarity, tfidfSimilarity);

      // Bio similarity
      const bioSimilarity = textSimilarity(
        userBio,
        `${job.title} ${job.description}`
      );

      // Past jobs similarity (shows pattern matching)
      const pastJobsSimilarity = appliedJobTexts
        ? textSimilarity(
            appliedJobTexts,
            `${job.title} ${job.description}`
          )
        : 0;

      // Calculate distance
      let distance: number | undefined;
      let distanceSimilarity = 1.0; // Default to full score if location not available

      if (userLocation && job.latitude && job.longitude) {
        distance = calculateDistance(userLocation, {
          latitude: job.latitude,
          longitude: job.longitude
        });
        
        // Calculate distance score
        if (distance <= 25) {
          distanceSimilarity = 1.0;
        } else if (distance > 50) {
          distanceSimilarity = 0.0;
        } else {
          // Linear interpolation between 25 and 50 km
          const ratio = (distance - 25) / (50 - 25);
          distanceSimilarity = Math.max(0, 1 - ratio);
        }
      }

      // Weighted calculation including past jobs and location
      const similarity =
        skillSimilarity * 0.35 +
        bioSimilarity * 0.2 +
        pastJobsSimilarity * 0.15 +
        distanceSimilarity * 0.3;

      return {
        jobId: job.job_id,
        similarity: Math.min(similarity, 1),
        distance,
        job
      };
    });

    // Sort by similarity
    rankedJobs.sort((a, b) => b.similarity - a.similarity);

    // Get query parameters
    const query = getQuery(event);
    const minSimilarity = query.minSimilarity
      ? parseFloat(query.minSimilarity as string)
      : 0.35; // Default to 0.35 (35%) to filter out low-relevance jobs
    const limit = query.limit ? parseInt(query.limit as string) : 20;
    const maxDistance = query.maxDistance ? 
      parseFloat(query.maxDistance as string) : undefined;

    // Filter by distance if specified
    let filteredRanks = rankedJobs;
    if (maxDistance && userLocation) {
      filteredRanks = rankedJobs.filter(match => {
        if (match.distance === undefined) return true; // Include jobs without location
        return match.distance <= maxDistance;
      });
    }

    // Filter and return recommendations
    const recommendations = filteredRanks
      .filter(match => match.similarity >= minSimilarity)
      .slice(0, limit)
      .map((match, index) => ({
        ...match.job,
        matchScore: match.similarity,
        matchRank: index + 1,
        distance: match.distance,
        matchReasons: generateMatchReasons(
          match.similarity,
          userSkills,
          match.job,
          match.distance
        )
      }));

    return {
      success: true,
      recommendations,
      totalMatches: filteredRanks.filter(m => m.similarity >= minSimilarity).length,
      userProfile: {
        skills: userSkills,
        bio: userBio ? userBio.substring(0, 100) + "..." : "No bio",
        appliedJobsCount: user.applications.length,
        location: user.location
      },
      userLocation: userLocation,
      algorithm: {
        name: "Advanced TF-IDF with Cosine Similarity + Geolocation",
        considersHistory: true,
        weights: {
          skillMatch: 0.35,
          bioMatch: 0.2,
          pastJobsMatch: 0.15,
          distanceMatch: 0.3
        }
      }
    };
  } catch (error: any) {
    console.error("Advanced job matching error:", error);
    return createError({
      statusCode: 500,
      message: error?.message || "Internal server error"
    });
  }
});

/**
 * Generate human-readable reasons for job match
 */
function generateMatchReasons(
  score: number,
  userSkills: string[],
  job: any,
  distance?: number
): string[] {
  const reasons: string[] = [];

  if (score >= 0.8) {
    reasons.push("Excellent match");
  } else if (score >= 0.6) {
    reasons.push("Good match");
  } else if (score >= 0.4) {
    reasons.push("Moderate match");
  }

  if (job.requiredSkills) {
    const jobSkills = job.requiredSkills.split(",").map((s: string) => s.trim());
    const matchedSkills = userSkills.filter(skill =>
      jobSkills.some(jobSkill =>
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );

    if (matchedSkills.length > 0) {
      reasons.push(
        `Matches your ${matchedSkills.length} skill${matchedSkills.length > 1 ? "s" : ""}`
      );
    }
  }

  // Add distance reason
  if (distance !== undefined) {
    if (distance <= 5) {
      reasons.push("Very close to you");
    } else if (distance <= 15) {
      reasons.push(`Close to you (${distance.toFixed(1)} km)`);
    } else if (distance <= 30) {
      reasons.push(`Moderate distance (${distance.toFixed(1)} km)`);
    } else if (distance <= 50) {
      reasons.push(`${distance.toFixed(1)} km away`);
    }
  }

  if (score < 0.4) {
    reasons.push("Consider applying to gain experience");
  }

  return reasons;
}
