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
    const category = query.category as string

    const prisma = new PrismaClient()

    // Build where clause
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get jobs with pagination
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
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
          _count: {
            select: {
              applications: true,
              reviews: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.job.count({ where })
    ])

    // Get unique categories for filter
    const categories = await prisma.job.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    })

    return {
      jobs,
      categories: categories.map(c => c.category),
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
