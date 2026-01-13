import { PrismaClient } from "@prisma/client"

interface UpdateApplicationBody {
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

    const applicationId = parseInt(event.context.params?.id as string)
    if (!applicationId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid application ID"
      })
    }

    const body = await readBody<UpdateApplicationBody>(event)
    const prisma = new PrismaClient()

    // Build update data
    const updateData: any = {}
    
    if (body.status) {
      // Validate status - using PascalCase to match the app's status flow
      const validStatuses = ['Pending', 'Interview', 'Hired', 'In Progress', 'Submitted', 'Completed', 'Revision', 'Rejected']
      if (!validStatuses.includes(body.status)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid status"
        })
      }
      updateData.status = body.status
      
      // If completed, set completed_at
      if (body.status === 'Completed') {
        updateData.completed_at = new Date()
      }
    }

    const updatedApplication = await prisma.application.update({
      where: { application_id: applicationId },
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
            status: true
          }
        }
      },
      data: updateData
    })

    return updatedApplication
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error"
    })
  }
})
