import { PrismaClient } from "@prisma/client"

export default defineEventHandler(async (event) => {
  try {
    // Check admin access
    const admin = await checkAdminAccess(event)
    if (!admin) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden - Admin access required"
      })
    }

    const prisma = new PrismaClient()

    // Get counts in parallel
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalReviews,
      usersByRole,
      recentUsers,
      applicationsByStatus,
      jobsByStatus
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total jobs
      prisma.job.count(),
      
      // Total applications
      prisma.application.count(),
      
      // Total reviews
      prisma.review.count(),
      
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          user_id: true
        }
      }),
      
      // Recent users (last 7 days)
      prisma.user.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Applications by status
      prisma.application.groupBy({
        by: ['status'],
        _count: {
          application_id: true
        }
      }),
      
      // Jobs by status
      prisma.job.groupBy({
        by: ['status'],
        _count: {
          job_id: true
        }
      })
    ])

    // Format users by role
    const roleStats = usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count.user_id
      return acc
    }, {} as Record<string, number>)

    // Format applications by status
    const applicationStats = applicationsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.application_id
      return acc
    }, {} as Record<string, number>)

    // Format jobs by status
    const jobStats = jobsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.job_id
      return acc
    }, {} as Record<string, number>)

    return {
      totalUsers,
      totalJobs,
      totalApplications,
      totalReviews,
      recentUsers,
      usersByRole: roleStats,
      applicationsByStatus: applicationStats,
      jobsByStatus: jobStats
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error"
    })
  }
})
