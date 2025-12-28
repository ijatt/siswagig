/**
 * Geolocation utilities for location-based job matching
 * Implements Haversine formula for distance calculations
 */

/**
 * Represents a geographic coordinate
 */
export interface Coordinate {
  latitude: number
  longitude: number
}

/**
 * Calculate distance between two coordinates using the Haversine formula
 * Returns distance in kilometers
 *
 * @param coord1 - First coordinate (latitude, longitude)
 * @param coord2 - Second coordinate (latitude, longitude)
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371 // Earth's radius in kilometers

  // Convert degrees to radians
  const lat1Rad = toRadians(coord1.latitude)
  const lat2Rad = toRadians(coord2.latitude)
  const deltaLat = toRadians(coord2.latitude - coord1.latitude)
  const deltaLon = toRadians(coord2.longitude - coord1.longitude)

  // Haversine formula
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Validate if coordinates are valid
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}

/**
 * Calculate distance score based on maximum acceptable distance
 * Returns a score between 0 and 1 where:
 * - 1.0 = job is within preferred distance
 * - 0.5 = job is at maximum distance
 * - 0.0 = job is beyond maximum distance
 *
 * @param distance - Distance in kilometers
 * @param maxPreferredDistance - Maximum preferred distance in kilometers (default: 25 km)
 * @param maxAcceptableDistance - Maximum acceptable distance in kilometers (default: 50 km)
 * @returns Distance score (0-1)
 */
export function calculateDistanceScore(
  distance: number,
  maxPreferredDistance: number = 25,
  maxAcceptableDistance: number = 50
): number {
  if (distance <= maxPreferredDistance) {
    return 1.0
  }

  if (distance > maxAcceptableDistance) {
    return 0.0
  }

  // Linear interpolation between preferred and acceptable distance
  const ratio = (distance - maxPreferredDistance) / (maxAcceptableDistance - maxPreferredDistance)
  return Math.max(0, 1 - ratio)
}

/**
 * Get distance category for display
 */
export function getDistanceCategory(distance: number): string {
  if (distance <= 5) return 'Very Close'
  if (distance <= 15) return 'Close'
  if (distance <= 30) return 'Moderate'
  if (distance <= 50) return 'Far'
  return 'Very Far'
}

/**
 * Filter jobs by maximum distance
 */
export function filterJobsByDistance(
  jobs: Array<{ latitude: number | null; longitude: number | null }>,
  userCoord: Coordinate,
  maxDistance: number
): Array<{ latitude: number | null; longitude: number | null; distance?: number }> {
  return jobs
    .map(job => {
      if (!job.latitude || !job.longitude) {
        return { ...job, distance: undefined }
      }
      const distance = calculateDistance(userCoord, {
        latitude: job.latitude,
        longitude: job.longitude
      })
      return { ...job, distance }
    })
    .filter(job => job.distance === undefined || job.distance <= maxDistance)
}

/**
 * Sort jobs by distance
 */
export function sortJobsByDistance(
  jobs: Array<{ latitude: number | null; longitude: number | null }>,
  userCoord: Coordinate
): Array<{ latitude: number | null; longitude: number | null; distance: number }> {
  return jobs
    .filter(job => job.latitude && job.longitude)
    .map(job => ({
      ...job,
      distance: calculateDistance(userCoord, {
        latitude: job.latitude!,
        longitude: job.longitude!
      })
    }))
    .sort((a, b) => a.distance - b.distance)
}
