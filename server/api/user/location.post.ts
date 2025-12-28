/**
 * API endpoint to save user location
 * POST /api/user/location
 */
import { PrismaClient } from "@prisma/client"

interface LocationRequest {
  location: string
  latitude: number
  longitude: number
}

export default defineEventHandler(async (event) => {
    const prisma = new PrismaClient()
  // Verify authentication
    
    const userId = await checkAccessToken(event);

    if (!userId) {
      return createError({
        statusCode: 401,
        message: "Unauthorized"
      });
    }

  try {
    const body = await readBody<LocationRequest>(event)

    // Validate input
    if (!body.location || body.latitude === undefined || body.longitude === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: location, latitude, longitude'
      })
    }

    // Validate coordinates
    if (body.latitude < -90 || body.latitude > 90 || body.longitude < -180 || body.longitude > 180) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid coordinates. Latitude must be -90 to 90, longitude must be -180 to 180'
      })
    }

    // Update user location in database
    const updatedUser = await prisma.user.update({
      where: { user_id: userId as number },
      data: {
        location: body.location,
        latitude: body.latitude,
        longitude: body.longitude
      },
      select: {
        user_id: true,
        name: true,
        location: true,
        latitude: true,
        longitude: true
      }
    })

    return {
      success: true,
      message: 'Location saved successfully',
      data: {
        user_id: updatedUser.user_id,
        name: updatedUser.name,
        location: updatedUser.location,
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude
      }
    }
  } catch (err: any) {
    console.error('Error saving location:', err)

    if (err.statusCode) {
      throw err
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save location'
    })
  }
})
