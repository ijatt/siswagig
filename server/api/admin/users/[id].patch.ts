import { PrismaClient } from "@prisma/client"

interface UpdateUserBody {
  role?: string
  is_active?: boolean
}

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

    const userId = parseInt(event.context.params?.id as string)
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid user ID"
      })
    }

    // Prevent admin from modifying their own role
    if (userId === admin.user_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot modify your own admin account"
      })
    }

    const body = await readBody<UpdateUserBody>(event)
    const prisma = new PrismaClient()

    // Build update data
    const updateData: any = {}
    
    if (body.role) {
      // Validate role
      const validRoles = ['freelancer', 'client', 'admin']
      if (!validRoles.includes(body.role)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid role"
        })
      }
      updateData.role = body.role
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        location: true,
        created_at: true,
        image_url: true,
        profile_completed: true
      },
      data: updateData
    })

    return updatedUser
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error"
    })
  }
})
