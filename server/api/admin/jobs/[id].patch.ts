import { PrismaClient } from "@prisma/client"

interface UpdateJobBody {
  status?: string
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

    const jobId = parseInt(event.context.params?.id as string)
    if (!jobId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid job ID"
      })
    }

    const body = await readBody<UpdateJobBody>(event)
    const prisma = new PrismaClient()

    // Build update data
    const updateData: any = {}
    
    if (body.status) {
      // Validate status - using lowercase with space for "in progress" to match the app
      const validStatuses = ['open', 'closed', 'in progress']
      if (!validStatuses.includes(body.status)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid status"
        })
      }
      updateData.status = body.status
    }

    const updatedJob = await prisma.job.update({
      where: { job_id: jobId },
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
            email: true,
            image_url: true
          }
        }
      },
      data: updateData
    })

    return updatedJob
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error"
    })
  }
})
