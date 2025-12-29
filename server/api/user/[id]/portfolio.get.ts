import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()

  try {
    const userId = getRouterParam(event, 'id')
    
    if (!userId) {
      return createError({ statusCode: 400, statusMessage: 'User ID required' })
    }

    // Get completed jobs that are visible in portfolio
    const portfolioItems = await prisma.application.findMany({
      where: {
        user_id: Number(userId),
        status: 'Completed',
        portfolio_visible: true
      },
      include: {
        job: {
          include: {
            user: {
              select: {
                user_id: true,
                name: true,
                image_url: true
              }
            },
            reviews: {
              where: {
                to_user_id: Number(userId)
              },
              select: {
                rating: true,
                comment: true,
                created_at: true,
                fromUser: {
                  select: {
                    name: true,
                    image_url: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        completed_at: 'desc'
      }
    })

    // Get portfolio stats
    const stats = await prisma.application.aggregate({
      where: {
        user_id: Number(userId),
        status: 'Completed'
      },
      _count: {
        application_id: true
      }
    })

    // Get average rating for this freelancer
    const ratingStats = await prisma.review.aggregate({
      where: {
        to_user_id: Number(userId)
      },
      _avg: {
        rating: true
      },
      _count: {
        review_id: true
      }
    })

    return {
      items: portfolioItems,
      totalCompleted: stats._count.application_id,
      averageRating: ratingStats._avg.rating || 0,
      totalReviews: ratingStats._count.review_id
    }
  } catch (err) {
    console.error('Error fetching portfolio:', err)
    return createError({ statusCode: 500, statusMessage: 'Failed to fetch portfolio' })
  } finally {
    await prisma.$disconnect()
  }
})
