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
    const status = query.status as string
    const search = query.search as string

    const prisma = new PrismaClient()

    // Build where clause
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { cover_letter: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { job: { title: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Get applications with pagination
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: {
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
              title: true,
              budget: true,
              status: true,
              user: {
                select: {
                  user_id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          payment: {
            select: {
              payment_id: true,
              amount: true,
              status: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.application.count({ where })
    ])

    // Get status counts for filters
    const statusCounts = await prisma.application.groupBy({
      by: ['status'],
      _count: {
        application_id: true
      }
    })

    return {
      applications,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.application_id
        return acc
      }, {} as Record<string, number>),
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
