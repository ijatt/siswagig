import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/stats/public - Get public stats for landing page (no auth required)
export default defineEventHandler(async () => {
  try {
    const [
      activeJobsCount,
      totalStudents,
      completedApplications,
      totalReviews,
      averageRating
    ] = await Promise.all([
      // Count active jobs (not completed or closed)
      prisma.job.count({
        where: {
          status: {
            notIn: ['Completed', 'Closed']
          }
        }
      }),
      
      // Count total users (students)
      prisma.user.count(),
      
      // Count completed applications (successful projects)
      prisma.application.count({
        where: {
          status: 'Completed'
        }
      }),
      
      // Count total reviews
      prisma.review.count(),
      
      // Get average rating from reviews
      prisma.review.aggregate({
        _avg: {
          rating: true
        }
      })
    ])

    // Calculate satisfaction rate based on average rating (out of 5)
    const avgRating = averageRating._avg.rating || 4.5
    const satisfactionRate = Math.round((avgRating / 5) * 100)

    return {
      activeJobs: activeJobsCount,
      totalStudents: totalStudents,
      satisfactionRate: satisfactionRate,
      completedProjects: completedApplications
    }
  } catch (error) {
    console.error('Error fetching public stats:', error)
    throw createError({
      statusCode: 500,
      message: "Failed to fetch stats"
    })
  }
})
