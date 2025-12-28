/**
 * Machine Learning Algorithms for Job Matching
 * Includes TF-IDF and Cosine Similarity implementations
 * Also includes geolocation-based distance scoring
 */

import {
  calculateDistance,
  calculateDistanceScore,
  type Coordinate
} from './geolocation'

/**
 * Tokenize and clean text for processing
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .split(/\s+/)
    .filter(word => word.length > 0)
}

/**
 * Calculate Term Frequency (TF)
 * TF(term) = (count of term in document) / (total number of terms in document)
 */
export function calculateTermFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>()
  const totalTerms = tokens.length

  tokens.forEach(token => {
    tf.set(token, (tf.get(token) || 0) + 1)
  })

  // Normalize by total terms
  tf.forEach((count, term) => {
    tf.set(term, count / totalTerms)
  })

  return tf
}

/**
 * Calculate Inverse Document Frequency (IDF)
 * IDF(term) = log(total documents / documents containing term)
 */
export function calculateIDF(allTokenizedDocs: string[][]): Map<string, number> {
  const idf = new Map<string, number>()
  const totalDocs = allTokenizedDocs.length
  const docFrequency = new Map<string, number>()

  // Count how many documents contain each term
  allTokenizedDocs.forEach(tokens => {
    const uniqueTokens = new Set(tokens)
    uniqueTokens.forEach(token => {
      docFrequency.set(token, (docFrequency.get(token) || 0) + 1)
    })
  })

  // Calculate IDF for each term
  docFrequency.forEach((count, term) => {
    idf.set(term, Math.log(totalDocs / count))
  })

  return idf
}

/**
 * Calculate TF-IDF vector for a document
 * TF-IDF(term) = TF(term) * IDF(term)
 */
export function calculateTFIDF(
  tokens: string[],
  idf: Map<string, number>
): Map<string, number> {
  const tf = calculateTermFrequency(tokens)
  const tfidf = new Map<string, number>()

  tf.forEach((tfValue, term) => {
    const idfValue = idf.get(term) || 0
    tfidf.set(term, tfValue * idfValue)
  })

  return tfidf
}

/**
 * Calculate Cosine Similarity between two TF-IDF vectors
 * Similarity = (A · B) / (||A|| * ||B||)
 * Where A · B is dot product and ||A||, ||B|| are magnitudes
 */
export function cosineSimilarity(
  vector1: Map<string, number>,
  vector2: Map<string, number>
): number {
  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0

  // Get all unique terms from both vectors
  const allTerms = new Set([...vector1.keys(), ...vector2.keys()])

  // Calculate dot product and magnitudes
  allTerms.forEach(term => {
    const val1 = vector1.get(term) || 0
    const val2 = vector2.get(term) || 0

    dotProduct += val1 * val2
    magnitude1 += val1 * val1
    magnitude2 += val2 * val2
  })

  magnitude1 = Math.sqrt(magnitude1)
  magnitude2 = Math.sqrt(magnitude2)

  // Avoid division by zero
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0
  }

  return dotProduct / (magnitude1 * magnitude2)
}

/**
 * Calculate similarity between two texts using TF-IDF and Cosine Similarity
 */
export function textSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1)
  const tokens2 = tokenize(text2)

  // Calculate IDF using both documents
  const idf = calculateIDF([tokens1, tokens2])

  // Calculate TF-IDF vectors
  const vector1 = calculateTFIDF(tokens1, idf)
  const vector2 = calculateTFIDF(tokens2, idf)

  // Return cosine similarity
  return cosineSimilarity(vector1, vector2)
}

/**
 * Calculate weighted similarity considering multiple factors
 */
export function calculateWeightedSimilarity(
  userSkills: string[],
  userBio: string,
  jobRequiredSkills: string[],
  jobTitle: string,
  jobDescription: string,
  weights = {
    skillMatch: 0.5,
    bioMatch: 0.3,
    titleMatch: 0.2
  }
): number {
  // Skill matching - use both keyword matching and TF-IDF
  const skillStr = userSkills.join(" ");
  const requiredSkillStr = jobRequiredSkills.join(" ");
  
  // Keyword-based matching (for exact or partial matches)
  const keywordSimilarity = calculateKeywordSimilarity(userSkills, jobRequiredSkills);
  
  // TF-IDF based matching
  const tfidfSimilarity = textSimilarity(skillStr, requiredSkillStr);
  
  // Use the higher of the two for skill matching
  const skillSimilarity = Math.max(keywordSimilarity, tfidfSimilarity);

  // Bio to job description matching
  const bioSimilarity = textSimilarity(
    userBio,
    `${jobTitle} ${jobDescription}`
  );

  // Job title matching (lightweight)
  const titleSimilarity = textSimilarity(skillStr, jobTitle);

  // Calculate weighted score
  const weightedScore =
    skillSimilarity * weights.skillMatch +
    bioSimilarity * weights.bioMatch +
    titleSimilarity * weights.titleMatch

  return Math.min(weightedScore, 1) // Normalize to 0-1 range
}

/**
 * Calculate weighted similarity WITH location/distance factor
 */
export function calculateWeightedSimilarityWithLocation(
  userSkills: string[],
  userBio: string,
  jobRequiredSkills: string[],
  jobTitle: string,
  jobDescription: string,
  userLocation: Coordinate | null,
  jobLocation: Coordinate | null,
  weights = {
    skillMatch: 0.4,
    bioMatch: 0.25,
    titleMatch: 0.15,
    distanceMatch: 0.2
  }
): number {
  // Calculate text-based similarity (skill, bio, title)
  const textSimilarity = calculateWeightedSimilarity(
    userSkills,
    userBio,
    jobRequiredSkills,
    jobTitle,
    jobDescription,
    {
      skillMatch: weights.skillMatch / (1 - weights.distanceMatch),
      bioMatch: weights.bioMatch / (1 - weights.distanceMatch),
      titleMatch: weights.titleMatch / (1 - weights.distanceMatch)
    }
  )

  // Calculate distance-based similarity
  let distanceSimilarity = 1.0 // Default to full score if location not available

  if (
    userLocation &&
    jobLocation &&
    userLocation.latitude &&
    userLocation.longitude &&
    jobLocation.latitude &&
    jobLocation.longitude
  ) {
    const distance = calculateDistance(userLocation, jobLocation)
    distanceSimilarity = calculateDistanceScore(
      distance,
      25, // Max preferred distance (25 km)
      50  // Max acceptable distance (50 km)
    )
  }

  // Calculate final weighted score
  const finalScore =
    textSimilarity * (1 - weights.distanceMatch) +
    distanceSimilarity * weights.distanceMatch

  return Math.min(finalScore, 1) // Normalize to 0-1 range
}

/**
// ...existing code...

/**
 * Calculate keyword-based similarity between skill lists
 * Checks for partial matches and related skills
 */
export function calculateKeywordSimilarity(
  userSkills: string[],
  jobSkills: string[]
): number {
  if (userSkills.length === 0 || jobSkills.length === 0) {
    return 0;
  }

  let matchCount = 0;

  userSkills.forEach(userSkill => {
    const userSkillLower = userSkill.toLowerCase();
    
    jobSkills.forEach(jobSkill => {
      const jobSkillLower = jobSkill.toLowerCase();
      
      // Exact match
      if (userSkillLower === jobSkillLower) {
        matchCount++;
      }
      // Partial match (one contains the other)
      else if (
        userSkillLower.includes(jobSkillLower) ||
        jobSkillLower.includes(userSkillLower)
      ) {
        matchCount += 0.5;
      }
      // Category match (e.g., all Adobe products, all design tools)
      else if (isRelatedSkill(userSkillLower, jobSkillLower)) {
        matchCount += 0.3;
      }
    });
  });

  // Normalize: similar/max possible
  const maxMatches = Math.max(userSkills.length, jobSkills.length);
  return Math.min(matchCount / maxMatches, 1);
}

/**
 * Check if two skills are related (e.g., design tools)
 */
function isRelatedSkill(skill1: string, skill2: string): boolean {
  const designTools = ['adobe', 'figma', 'xd', 'sketch', 'photoshop', 'illustrator', 'design', 'ui', 'ux', 'prototyp'];
  const developmentTools = ['react', 'vue', 'angular', 'javascript', 'typescript', 'python', 'java', 'nodejs', 'node', 'dev', 'program'];
  const dataTools = ['sql', 'database', 'mongodb', 'postgres', 'mysql', 'data', 'analytics'];

  const isDesign1 = designTools.some(tool => skill1.includes(tool));
  const isDesign2 = designTools.some(tool => skill2.includes(tool));

  const isDev1 = developmentTools.some(tool => skill1.includes(tool));
  const isDev2 = developmentTools.some(tool => skill2.includes(tool));

  const isData1 = dataTools.some(tool => skill1.includes(tool));
  const isData2 = dataTools.some(tool => skill2.includes(tool));

  return (isDesign1 && isDesign2) || (isDev1 && isDev2) || (isData1 && isData2);
}

/**
 * Rank jobs based on user profile
 */
export interface JobMatch {
  jobId: number
  similarity: number
  rank: number
  distance?: number
}

export function rankJobs(
  jobs: Array<{
    job_id: number
    requiredSkills?: string | null
    title: string
    description: string
  }>,
  userSkills: string[],
  userBio: string
): JobMatch[] {
  const matches = jobs.map(job => {
    // Parse required skills - handle both comma and slash separated
    const requiredSkills = job.requiredSkills
      ? job.requiredSkills
          .split(/[,/]/) // Split by comma or slash
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : []

    const similarity = calculateWeightedSimilarity(
      userSkills,
      userBio,
      requiredSkills,
      job.title,
      job.description
    )

    return {
      jobId: job.job_id,
      similarity,
      rank: 0
    }
  })

  // Sort by similarity score
  matches.sort((a, b) => b.similarity - a.similarity)

  // Assign ranks
  matches.forEach((match, index) => {
    match.rank = index + 1
  })

  return matches
}

/**
 * Rank jobs based on user profile WITH location consideration
 */
export function rankJobsWithLocation(
  jobs: Array<{
    job_id: number
    requiredSkills?: string | null
    title: string
    description: string
    latitude: number | null
    longitude: number | null
  }>,
  userSkills: string[],
  userBio: string,
  userLocation: Coordinate | null
): JobMatch[] {
  const matches = jobs.map(job => {
    // Parse required skills - handle both comma and slash separated
    const requiredSkills = job.requiredSkills
      ? job.requiredSkills
          .split(/[,/]/) // Split by comma or slash
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : []

    // Convert job location to coordinate
    const jobLocation: Coordinate | null =
      job.latitude && job.longitude
        ? { latitude: job.latitude, longitude: job.longitude }
        : null

    // Calculate similarity with location consideration
    const similarity = calculateWeightedSimilarityWithLocation(
      userSkills,
      userBio,
      requiredSkills,
      job.title,
      job.description,
      userLocation,
      jobLocation
    )

    // Calculate distance if both locations are available
    let distance: number | undefined
    if (userLocation && jobLocation) {
      distance = calculateDistance(userLocation, jobLocation)
    }

    return {
      jobId: job.job_id,
      similarity,
      rank: 0,
      distance
    }
  })

  // Sort by similarity score (which includes distance)
  matches.sort((a, b) => b.similarity - a.similarity)

  // Assign ranks
  matches.forEach((match, index) => {
    match.rank = index + 1
  })

  return matches
}
