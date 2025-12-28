/**
 * Composable for job recommendations and matching
 */

interface RecommendedJob {
  job_id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: number;
  deadline: string;
  matchScore: number;
  matchRank: number;
  matchReasons?: string[];
}

interface JobRecommendationResult {
  recommendations: RecommendedJob[];
  totalMatches: number;
  userSkills: string[];
  algorithm: {
    name: string;
    weights: {
      skillMatch: number;
      bioMatch: number;
      titleMatch?: number;
      pastJobsMatch?: number;
    };
  };
}

export const useJobRecommendations = () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const recommendations = ref<RecommendedJob[]>([]);
  const totalMatches = ref(0);

  /**
   * Fetch job recommendations based on user skills
   */
  const getRecommendations = async (
    endpoint: string = '/api/jobs/recommended',
    options: { minSimilarity?: number; limit?: number } = {}
  ) => {
    isLoading.value = true;
    error.value = null;

    try {
      const { minSimilarity = 0, limit = 20 } = options;

      const query = new URLSearchParams();
      if (minSimilarity > 0) query.append('minSimilarity', minSimilarity.toString());
      if (limit > 0) query.append('limit', limit.toString());

      const token = useMyTokenStore().accessToken;

      const data = await $fetch<JobRecommendationResult>(
        `${endpoint}?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      recommendations.value = data.recommendations;
      totalMatches.value = data.totalMatches;

      return data;
    } catch (err: any) {
      const errorMsg = err?.data?.message || 'Failed to fetch recommendations';
      error.value = errorMsg;
      console.error('Job recommendations error:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch recommendations with application history considered
   */
  const getAdvancedRecommendations = async (
    options: { minSimilarity?: number; limit?: number } = {}
  ) => {
    return getRecommendations('/api/jobs/match-with-history', options);
  };

  /**
   * Filter recommendations by score threshold
   */
  const filterByScore = (minScore: number) => {
    return recommendations.value.filter(rec => rec.matchScore >= minScore);
  };

  /**
   * Get top N recommendations
   */
  const getTopRecommendations = (n: number) => {
    return recommendations.value.slice(0, n);
  };

  /**
   * Get recommendations by category
   */
  const filterByCategory = (category: string) => {
    return recommendations.value.filter(
      rec => rec.category.toLowerCase() === category.toLowerCase()
    );
  };

  /**
   * Format match score as percentage
   */
  const formatScore = (score: number): string => {
    return `${Math.round(score * 100)}%`;
  };

  return {
    // State
    isLoading,
    error,
    recommendations,
    totalMatches,

    // Methods
    getRecommendations,
    getAdvancedRecommendations,
    filterByScore,
    getTopRecommendations,
    filterByCategory,
    formatScore
  };
};
