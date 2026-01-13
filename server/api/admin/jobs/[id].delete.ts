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

    const jobId = parseInt(event.context.params?.id as string)
    if (!jobId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid job ID"
      })
    }

    const prisma = new PrismaClient()

    // Delete job (cascading will handle related records based on schema)
    await prisma.job.delete({
      where: { job_id: jobId }
    })

    return { success: true, message: "Job deleted successfully" }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error"
    })
  }
})
