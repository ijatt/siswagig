# Job Matching AI Algorithm Documentation

## Overview

The job matching system uses **TF-IDF (Term Frequency-Inverse Document Frequency)** vectorization combined with **Cosine Similarity** to intelligently recommend jobs to freelancers based on their skills, bio, and application history.

## Algorithm Components

### 1. TF-IDF (Term Frequency-Inverse Document Frequency)

TF-IDF is a numerical statistic that reflects how important a word is to a document in a collection of documents.

#### Formula:
```
TF-IDF(term) = TF(term) × IDF(term)
```

#### Where:
- **TF (Term Frequency)**: `count of term in document / total terms in document`
- **IDF (Inverse Document Frequency)**: `log(total documents / documents containing term)`

#### Implementation:
The algorithm tokenizes text, removes special characters, and calculates frequency scores for each term.

### 2. Cosine Similarity

Cosine Similarity measures the cosine of the angle between two vectors. It ranges from 0 (no similarity) to 1 (perfect match).

#### Formula:
```
Similarity = (A · B) / (||A|| × ||B||)

Where:
- A · B = dot product of vectors
- ||A|| = magnitude of vector A
- ||B|| = magnitude of vector B
```

### 3. Weighted Similarity Calculation

The system combines multiple factors with configurable weights:

```
Match Score = (Skill Match × 0.5) + (Bio Match × 0.3) + (Past Jobs Match × 0.2)
```

## API Endpoints

### 1. Basic Recommendations
**Endpoint**: `GET /api/jobs/recommended`

Uses current skills and bio to recommend jobs.

#### Query Parameters:
- `minSimilarity` (optional): Minimum match score (0-1). Default: 0
- `limit` (optional): Maximum number of recommendations. Default: 20

#### Response:
```json
{
  "recommendations": [
    {
      "job_id": 1,
      "title": "Build E-commerce Website",
      "description": "...",
      "category": "Web Development",
      "location": "Remote",
      "budget": 2000,
      "deadline": "2025-12-31",
      "matchScore": 0.85,
      "matchRank": 1
    }
  ],
  "totalMatches": 15,
  "userSkills": ["React", "Node.js", "MongoDB"],
  "algorithm": {
    "name": "TF-IDF with Cosine Similarity",
    "weights": {
      "skillMatch": 0.5,
      "bioMatch": 0.3,
      "titleMatch": 0.2
    }
  }
}
```

### 2. Advanced Recommendations with History
**Endpoint**: `GET /api/jobs/match-with-history`

Considers the user's application history for better matching.

#### Query Parameters:
- `minSimilarity` (optional): Minimum match score (0-1). Default: 0.3
- `limit` (optional): Maximum number of recommendations. Default: 20

#### Response:
```json
{
  "success": true,
  "recommendations": [
    {
      "job_id": 1,
      "title": "Build E-commerce Website",
      "description": "...",
      "matchScore": 0.89,
      "matchRank": 1,
      "matchReasons": [
        "Excellent skill match",
        "Matches your 3 skills",
        "Similar to previous applications"
      ]
    }
  ],
  "totalMatches": 18,
  "userProfile": {
    "skills": ["React", "Node.js", "MongoDB"],
    "bio": "Full-stack developer with 3 years experience...",
    "appliedJobsCount": 12
  },
  "algorithm": {
    "name": "Advanced TF-IDF with Cosine Similarity",
    "considersHistory": true,
    "weights": {
      "skillMatch": 0.5,
      "bioMatch": 0.3,
      "pastJobsMatch": 0.2
    }
  }
}
```

## Frontend Integration

### Using the Composable

```typescript
// In a Vue component
const {
  recommendations,
  isLoading,
  error,
  getAdvancedRecommendations,
  formatScore
} = useJobRecommendations();

// Fetch recommendations on mount
onMounted(async () => {
  await getAdvancedRecommendations({
    minSimilarity: 0.3,
    limit: 20
  });
});

// In template
<div v-for="job in recommendations" :key="job.job_id">
  <h3>{{ job.title }}</h3>
  <p>{{ formatScore(job.matchScore) }} match</p>
</div>
```

### Available Methods

- `getRecommendations(endpoint, options)` - Fetch basic recommendations
- `getAdvancedRecommendations(options)` - Fetch recommendations with history
- `filterByScore(minScore)` - Filter recommendations by similarity score
- `getTopRecommendations(n)` - Get top N recommendations
- `filterByCategory(category)` - Filter by job category
- `formatScore(score)` - Format score as percentage string

## Data Requirements

### User Profile
- **Skills**: Array of skill names (e.g., "React", "Node.js")
- **Bio**: Description of experience and expertise
- **Application History**: Previous job applications (considered in advanced matching)

### Job Data
- **Title**: Job name/title
- **Description**: Detailed job description
- **RequiredSkills**: Comma-separated list of required skills
- **Category**: Job category for filtering
- **Status**: Only "open" jobs are recommended

## How It Works

1. **Tokenization**: Text is tokenized and cleaned (lowercase, special characters removed)

2. **TF Calculation**: For each word, calculate how frequently it appears in the document

3. **IDF Calculation**: Calculate how rare/unique each word is across all documents

4. **TF-IDF Vector**: Combine TF and IDF to create vectors for user profile and jobs

5. **Cosine Similarity**: Calculate angle between vectors to find similarity

6. **Weighted Score**: Apply weights to different matching factors:
   - 50% weight to skill matching (most important)
   - 30% weight to bio/experience matching
   - 20% weight to past job pattern matching

7. **Ranking**: Sort jobs by match score and return top results

## Configuration

### Adjusting Weights

Modify weights in [ml-algorithms.ts](../../server/utils/ml-algorithms.ts):

```typescript
const weights = {
  skillMatch: 0.5,      // Higher = prioritize skills
  bioMatch: 0.3,        // Experience matching
  titleMatch: 0.2       // Title relevance
};
```

### Minimum Similarity Threshold

Default is 0.3 (30%) for advanced matching. Adjust based on how strict you want recommendations:
- Lower = more recommendations (0.1-0.2)
- Higher = only high-quality matches (0.5+)

## Performance Considerations

- **Caching**: Consider caching recommendations with TTL for frequently accessed users
- **Database**: Ensure indexes on job status and user_id for fast queries
- **Scaling**: For large datasets, consider:
  - Pre-computing TF-IDF vectors
  - Using approximate nearest neighbor search
  - Implementing pagination with limit parameter

## Future Enhancements

1. **Collaborative Filtering**: Recommend jobs based on similar freelancers' choices
2. **Content-Based Filtering**: Improve job descriptions with structured data
3. **Hybrid Approach**: Combine multiple algorithms for better accuracy
4. **User Feedback Loop**: Learn from which recommendations users accept
5. **Real-Time Updates**: Update recommendations as user profile changes
6. **Deep Learning**: Use embeddings and neural networks for semantic matching

## Testing

To test the algorithm locally:

```bash
# Fetch recommendations
curl -X GET "http://localhost:3000/api/jobs/recommended?minSimilarity=0.3&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Fetch advanced recommendations
curl -X GET "http://localhost:3000/api/jobs/match-with-history?minSimilarity=0.3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## References

- [TF-IDF Wikipedia](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
- [Information Retrieval](https://en.wikipedia.org/wiki/Information_retrieval)
