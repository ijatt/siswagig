import { PrismaClient } from "@prisma/client";
import { rankJobsWithLocation, type JobMatch } from "~~/server/utils/ml-algorithms";

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

    // Fetch user profile with skills and location
    const user = await prisma.user.findUnique({
      where: { user_id: userId as number },
      include: {
        userSkills: {
          include: {
            skill: true
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

    // Get all available jobs (without status filter)
    const jobs = await prisma.job.findMany({
      where: {
        NOT: {
          user_id: userId as number // Exclude jobs posted by the user
        }
      },
      include: {
        user: {
          select: {
            name: true,
            image_url: true
          }
        }
      }
    });

    // Extract user skills and location
    const userSkills = user.userSkills.map(us => us.skill.name);
    const userBio = user.bio || "";
    const userLocation = user.latitude && user.longitude
      ? { latitude: user.latitude, longitude: user.longitude }
      : null;

    // Rank jobs based on user profile WITH location consideration
    const rankedJobs = rankJobsWithLocation(
      jobs,
      userSkills,
      userBio,
      userLocation
    );

    // Get query parameters for filtering
    const query = getQuery(event);
    const minSimilarity = query.minSimilarity ? 
      parseFloat(query.minSimilarity as string) : 0.35; // Default 35% threshold
    const limit = query.limit ? 
      parseInt(query.limit as string) : 20;
    const maxDistance = query.maxDistance ? 
      parseFloat(query.maxDistance as string) : undefined;

    // Filter by distance if specified
    let filteredRanks = rankedJobs;
    if (maxDistance && userLocation) {
      filteredRanks = rankedJobs.filter((match: JobMatch & { distance?: number }) => {
        if (match.distance === undefined) return true; // Include jobs without location
        return match.distance <= maxDistance;
      });
    }

    // Filter and limit results
    const recommendedJobIds = filteredRanks
      .filter((match: JobMatch) => match.similarity >= minSimilarity)
      .slice(0, limit)
      .map((match: JobMatch) => match.jobId);

    // Fetch detailed job data
    const recommendedJobs = jobs
      .filter(job => recommendedJobIds.includes(job.job_id))
      .map(job => {
        const match = rankedJobs.find((m: JobMatch) => m.jobId === job.job_id);
        return {
          ...job,
          matchScore: match?.similarity || 0,
          matchRank: match?.rank || 0,
          distance: match?.distance || null,
          userLocation: userLocation
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return {
      recommendations: recommendedJobs,
      totalMatches: rankedJobs.length,
      userSkills: userSkills,
      userLocation: userLocation,
      algorithm: {
        name: "TF-IDF with Cosine Similarity + Geolocation",
        weights: {
          skillMatch: 0.4,
          bioMatch: 0.25,
          titleMatch: 0.15,
          distanceMatch: 0.2
        }
      }
    };
  } catch (error: any) {
    console.error("Job recommendation error:", error);
    return createError({
      statusCode: 500,
      message: error?.message || "Internal server error"
    });
  }
});
