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

    const reviewId = parseInt(event.context.params?.id as string)
    if (!reviewId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid review ID"
      })
    }

    const prisma = new PrismaClient()

    // Delete review
    await prisma.review.delete({
      where: { review_id: reviewId }
    })

    return { success: true, message: "Review deleted successfully" }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error"
    })
  }
})
