import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/user/freelancers - Get all freelancers for clients to browse
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = query.search as string | undefined
    const skillId = query.skill_id ? parseInt(query.skill_id as string) : undefined
    const limit = query.limit ? parseInt(query.limit as string) : 50

    // Build where clause
    const where: any = {
      role: 'freelancer',
      profile_completed: true
    }

    // Search by name, bio, location, or skill name
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { 
          userSkills: { 
            some: { 
              skill: { 
                name: { contains: search, mode: 'insensitive' } 
              } 
            } 
          } 
        }
      ]
    }

    // Filter by skill
    if (skillId) {
      where.userSkills = {
        some: {
          skill_id: skillId
        }
      }
    }

    const freelancers = await prisma.user.findMany({
      where,
      select: {
        user_id: true,
        name: true,
        bio: true,
        location: true,
        image_url: true,
        created_at: true,
        latitude: true,
        longitude: true,
        userSkills: {
          include: {
            skill: true
          }
        },
        // Get review stats
        reviewsTo: {
          select: {
            rating: true
          }
        },
        // Get completed jobs count
        applications: {
          where: {
            status: 'Completed'
          },
          select: {
            application_id: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit
    })

    // Format response with computed fields
    const formattedFreelancers = freelancers.map(f => {
      const reviews = f.reviewsTo || []
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0

      return {
        user_id: f.user_id,
        name: f.name,
        bio: f.bio,
        location: f.location,
        image_url: f.image_url,
        latitude: f.latitude,
        longitude: f.longitude,
        skills: f.userSkills.map(us => us.skill.name),
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
        completedJobs: f.applications.length,
        joinedAt: f.created_at
      }
    })

    return formattedFreelancers
  } catch (error) {
    console.error('Error fetching freelancers:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch freelancers'
    })
  }
})
