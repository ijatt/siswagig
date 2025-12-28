# Geolocation-Based Job Matching Implementation Guide

## Overview

SiswaGig now supports **Location-Based Services (LBS)** to improve job matching by incorporating geographic distance as a factor in the AI matching algorithm. This feature helps freelancers find jobs closer to their location, reducing travel time and improving job accessibility.

## Features

✅ **User Location Management**
- Detect location using Browser Geolocation API
- Manually enter location with coordinates
- Store latitude/longitude in database

✅ **Distance Calculation**
- Haversine formula for accurate distance calculation
- Distance returned in kilometers
- Distance categories: Very Close (≤5km), Close (5-15km), Moderate (15-30km), Far (30-50km), Very Far (>50km)

✅ **Enhanced Matching Algorithm**
- Combined skill + location scoring
- Configurable weights for distance factor (default: 20%)
- Distance-based filtering with maximum distance parameters
- Backward compatible with existing skill-based matching

✅ **User Interface**
- LocationPicker component for location setup
- Distance badges on job cards
- Distance display in job details
- Match score + distance badges in explore page

## Database Schema Changes

### User Model
```prisma
model User {
  // ... existing fields ...
  latitude         Float?   @default(0)  // User's latitude coordinate
  longitude        Float?   @default(0)  // User's longitude coordinate
}
```

### Job Model
```prisma
model Job {
  // ... existing fields ...
  latitude    Float?   @default(0)  // Job location latitude
  longitude   Float?   @default(0)  // Job location longitude
}
```

## New Files Created

### 1. Server Utilities

#### `server/utils/geolocation.ts`
Implements geolocation calculations:
- `calculateDistance(coord1, coord2)` - Haversine formula implementation
- `calculateDistanceScore(distance, maxPreferred, maxAcceptable)` - Convert distance to score
- `getDistanceCategory(distance)` - Categorize distance (Very Close, Close, etc.)
- `filterJobsByDistance(jobs, userCoord, maxDistance)` - Filter jobs by distance
- `sortJobsByDistance(jobs, userCoord)` - Sort jobs by proximity

### 2. Client Components

#### `app/components/LocationPicker.vue`
Interactive component for location management:
- **Detect Tab**: Uses Browser Geolocation API to auto-detect location
- **Manual Tab**: Allows manual entry of location name and coordinates
- Validation of latitude (-90 to 90) and longitude (-180 to 180)
- Success/error messages
- Shows current saved location

#### `app/components/DistanceDisplay.vue`
Displays distance information:
- Shows distance in km with 1 decimal place
- Shows distance category
- Handles missing location data gracefully

### 3. API Endpoints

#### `server/api/user/location.post.ts`
Saves user location to database:
```
POST /api/user/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "location": "Shah Alam, Selangor",
  "latitude": 3.0736,
  "longitude": 101.5184
}
```

Response:
```json
{
  "success": true,
  "message": "Location saved successfully",
  "data": {
    "user_id": 1,
    "name": "John Doe",
    "location": "Shah Alam, Selangor",
    "latitude": 3.0736,
    "longitude": 101.5184
  }
}
```

## Updated API Endpoints

### Enhanced Job Recommendations
**Endpoint**: `GET /api/jobs/recommended`

**New Query Parameters**:
- `maxDistance` (optional): Maximum distance in km to consider (default: no limit)
- Example: `/api/jobs/recommended?maxDistance=25&limit=20`

**Response Changes**:
```json
{
  "recommendations": [
    {
      "job_id": 1,
      "title": "Build Website",
      "description": "...",
      "category": "Web Development",
      "location": "Petaling Jaya",
      "budget": 2000,
      "deadline": "2025-12-31",
      "matchScore": 0.85,
      "matchRank": 1,
      "distance": 12.5,  // NEW: Distance in km
      "userLocation": {  // NEW: User's location
        "latitude": 3.0957,
        "longitude": 101.5934
      }
    }
  ],
  "totalMatches": 15,
  "userSkills": ["React", "Node.js"],
  "userLocation": {  // NEW: User's location in response
    "latitude": 3.0957,
    "longitude": 101.5934
  },
  "algorithm": {
    "name": "TF-IDF with Cosine Similarity + Geolocation",
    "weights": {
      "skillMatch": 0.4,
      "bioMatch": 0.25,
      "titleMatch": 0.15,
      "distanceMatch": 0.2  // NEW: Distance weight
    }
  }
}
```

### Advanced Recommendations with History
**Endpoint**: `GET /api/jobs/match-with-history`

**Features**:
- Considers user's application history
- Incorporates distance-based filtering
- Enhanced match reasons including proximity information

**Response Changes**:
```json
{
  "success": true,
  "recommendations": [
    {
      "job_id": 1,
      "title": "UI Design Project",
      "distance": 8.3,  // NEW
      "matchScore": 0.78,
      "matchReasons": [
        "Good match",
        "Matches your 3 skills",
        "Very close to you",  // NEW: Distance reason
      ]
    }
  ],
  "algorithm": {
    "name": "Advanced TF-IDF with Cosine Similarity + Geolocation",
    "considersHistory": true,
    "weights": {
      "skillMatch": 0.35,
      "bioMatch": 0.2,
      "pastJobsMatch": 0.15,
      "distanceMatch": 0.3  // NEW
    }
  }
}
```

## Updated Machine Learning Algorithm

### New Functions in `server/utils/ml-algorithms.ts`

#### `calculateWeightedSimilarityWithLocation()`
Enhances the original similarity calculation with geolocation:
```typescript
export function calculateWeightedSimilarityWithLocation(
  userSkills: string[],
  userBio: string,
  jobRequiredSkills: string[],
  jobTitle: string,
  jobDescription: string,
  userLocation: Coordinate | null,
  jobLocation: Coordinate | null,
  weights = {
    skillMatch: 0.4,        // 40% - Skills matching
    bioMatch: 0.25,         // 25% - Bio matching
    titleMatch: 0.15,       // 15% - Title matching
    distanceMatch: 0.2      // 20% - Distance/proximity
  }
): number
```

**Algorithm Logic**:
1. Calculate text-based similarity (skills + bio + title) = 80%
2. Calculate distance-based score:
   - ≤25 km (preferred): Score = 1.0 (100%)
   - 25-50 km (acceptable): Linear interpolation
   - >50 km: Score = 0.0 (0%)
3. Combine scores: `finalScore = textSimilarity × 0.8 + distanceSimilarity × 0.2`

#### `rankJobsWithLocation()`
Extends job ranking to include distance:
- Returns `JobMatch` with additional `distance` field
- Jobs are sorted by combined similarity score
- Distance information preserved in results

## Usage Examples

### 1. User Sets Location (Profile Page)
```vue
<template>
  <LocationPicker />
</template>
```

The component handles:
- Auto-detection via browser geolocation
- Manual entry with validation
- API call to save location
- Confirmation messages

### 2. Fetching Recommendations with Distance Filter
```typescript
// Get jobs within 25 km that match skills
const recommendations = await $fetch(
  '/api/jobs/recommended?maxDistance=25&minSimilarity=0.3&limit=20',
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
)

// Display results with distance info
recommendations.forEach(job => {
  console.log(`${job.title} - ${job.distance} km away (${job.matchScore * 100}% match)`)
})
```

### 3. Job Detail Page with Distance Display
```vue
<template>
  <div v-if="jobDistance !== null" class="distance-info">
    <p>{{ jobDistance.toFixed(1) }} km from your location</p>
    <p>{{ distanceCategory }}</p>
  </div>
</template>

<script setup>
import { calculateDistance } from '~/server/utils/geolocation'

const userLocation = ref<Coordinate | null>(null)
const jobDistance = ref<number | null>(null)

onMounted(async () => {
  const user = await $fetch('/api/user')
  if (user?.latitude && user?.longitude) {
    userLocation.value = {
      latitude: user.latitude,
      longitude: user.longitude
    }
    
    if (job.latitude && job.longitude) {
      jobDistance.value = calculateDistance(userLocation.value, {
        latitude: job.latitude,
        longitude: job.longitude
      })
    }
  }
})
</script>
```

## Configuration

### Distance Thresholds (Customizable)

In `server/utils/geolocation.ts`:
```typescript
// Default preferred distance: 25 km (excellent match)
// Default acceptable distance: 50 km (still reasonable)
// These can be adjusted per application needs

export function calculateDistanceScore(
  distance: number,
  maxPreferredDistance: number = 25,    // Adjust here
  maxAcceptableDistance: number = 50    // Adjust here
): number
```

### Algorithm Weights (Customizable)

In job matching endpoints, customize the weights:
```typescript
const weights = {
  skillMatch: 0.4,      // Skill matching weight
  bioMatch: 0.25,       // Bio/profile matching weight
  titleMatch: 0.15,     // Job title matching weight
  distanceMatch: 0.2    // Distance/proximity weight
  // Total: 1.0 (100%)
}
```

## Integration Checklist

- [x] Database schema updated with latitude/longitude fields
- [x] Database migration created and applied
- [x] Geolocation utility functions implemented
- [x] LocationPicker component created
- [x] Location API endpoint implemented
- [x] ML algorithm updated with distance scoring
- [x] Job recommendation endpoints enhanced
- [x] Explore page UI updated with distance badges
- [x] Job detail page shows distance information
- [x] Profile edit page includes LocationPicker

## Testing Guide

### Manual Testing

1. **Location Detection**
   - Navigate to profile/edit
   - Click "Detect My Location" in LocationPicker
   - Grant browser permission
   - Verify location is saved

2. **Manual Location Entry**
   - Switch to "Manual Entry" tab
   - Enter: Shah Alam, Selangor
   - Latitude: 3.0736, Longitude: 101.5184
   - Verify location is saved

3. **Job Recommendations with Distance**
   - Ensure user has location set
   - Visit /explore with AI Recommendations enabled
   - Verify distance badges appear on job cards
   - Jobs should be ranked by skill + distance

4. **Distance Filtering**
   - Fetch: `/api/jobs/recommended?maxDistance=15`
   - Only jobs within 15 km should return

### Unit Testing

```typescript
import { calculateDistance, calculateDistanceScore } from '~/server/utils/geolocation'

describe('Geolocation Utilities', () => {
  it('should calculate distance correctly', () => {
    const distance = calculateDistance(
      { latitude: 3.0957, longitude: 101.5934 },
      { latitude: 3.0736, longitude: 101.5184 }
    )
    expect(distance).toBeCloseTo(8.4, 1) // ~8.4 km
  })

  it('should calculate distance score correctly', () => {
    const score1 = calculateDistanceScore(10)    // Within preferred
    const score2 = calculateDistanceScore(30)    // Between preferred and acceptable
    const score3 = calculateDistanceScore(60)    // Beyond acceptable
    
    expect(score1).toBe(1.0)
    expect(score2).toBeGreaterThan(0.5)
    expect(score3).toBe(0.0)
  })
})
```

## Performance Considerations

1. **Distance Calculations**: O(1) - Haversine formula is efficient
2. **Filtering**: O(n) - Single pass through jobs list
3. **Database Queries**: Already optimized with existing indexes
4. **Caching**: Distance scores cached in recommendations response

## Browser Compatibility

**Geolocation API Support**:
- Chrome 5+
- Firefox 3.5+
- Safari 5+
- Edge 12+
- IE 9+ (requires HTTPS)

**HTTPS Required**: Geolocation API requires secure context (HTTPS)

## Security & Privacy

1. **User Consent**: Browser requests explicit permission before accessing location
2. **Data Storage**: Coordinates stored in database (same as other user data)
3. **API Protection**: Location endpoint requires authentication token
4. **Location Accuracy**: Browser provides approximate location (not exact)

## Troubleshooting

### Location not detecting
- Verify HTTPS is enabled
- Check browser permissions for location access
- Try manual entry instead
- Clear browser cache and try again

### Distance showing as undefined
- Ensure user has location saved
- Verify job location coordinates are populated
- Check API response includes `distance` field

### Incorrect distance calculations
- Verify coordinates are in correct format (latitude: -90 to 90, longitude: -180 to 180)
- Check timezone isn't affecting calculations
- Test with known coordinates (e.g., UiTM campuses)

## Future Enhancements

- [ ] Google Maps integration for visual location picker
- [ ] Radius-based job search visualization
- [ ] Route time estimation (travel time instead of straight distance)
- [ ] User preference for maximum acceptable distance
- [ ] Location history tracking
- [ ] Batch geocoding for job creation
- [ ] Real-time location updates
- [ ] Push notifications for nearby jobs

## References

- **Haversine Formula**: https://en.wikipedia.org/wiki/Haversine_formula
- **Geolocation API**: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- **Prisma Documentation**: https://www.prisma.io/docs/
