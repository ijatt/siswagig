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

    const userId = parseInt(event.context.params?.id as string)
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid user ID"
      })
    }

    // Prevent admin from deleting their own account
    if (userId === admin.user_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot delete your own admin account"
      })
    }

    const prisma = new PrismaClient()

    // Delete user (cascading will handle related records based on schema)
    await prisma.user.delete({
      where: { user_id: userId }
    })

    return { success: true, message: "User deleted successfully" }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error"
    })
  }
})
