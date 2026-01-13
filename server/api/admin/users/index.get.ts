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
    const role = query.role as string
    const search = query.search as string
    const status = query.status as string

    const prisma = new PrismaClient()

    // Build where clause
    const where: any = {}
    
    if (role && role !== 'all') {
      where.role = role
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          user_id: true,
          name: true,
          email: true,
          role: true,
          location: true,
          created_at: true,
          image_url: true,
          profile_completed: true,
          bio: true,
          _count: {
            select: {
              jobs: true,
              applications: true,
              reviewsFrom: true,
              reviewsTo: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    return {
      users,
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
