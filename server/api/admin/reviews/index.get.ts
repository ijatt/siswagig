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

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const rating = query.rating as string
    const search = query.search as string

    const prisma = new PrismaClient()

    // Build where clause
    const where: any = {}
    
    if (rating && rating !== 'all') {
      where.rating = parseInt(rating)
    }
    
    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { fromUser: { name: { contains: search, mode: 'insensitive' } } },
        { toUser: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          fromUser: {
            select: {
              user_id: true,
              name: true,
              email: true,
              image_url: true
            }
          },
          toUser: {
            select: {
              user_id: true,
              name: true,
              email: true,
              image_url: true
            }
          },
          job: {
            select: {
              job_id: true,
              title: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.review.count({ where })
    ])

    // Get rating distribution
    const ratingCounts = await prisma.review.groupBy({
      by: ['rating'],
      _count: {
        review_id: true
      }
    })

    return {
      reviews,
      ratingCounts: ratingCounts.reduce((acc, item) => {
        acc[item.rating] = item._count.review_id
        return acc
      }, {} as Record<number, number>),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error"
    })
  }
})
