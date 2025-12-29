import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()

  try {
    const user_id = await checkAccessToken(event)
    if (!user_id) {
      return createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const applicationId = getRouterParam(event, 'id')
    
    if (!applicationId) {
      return createError({ statusCode: 400, statusMessage: 'Application ID required' })
    }

    const body = await readBody<{
      portfolio_visible?: boolean
      portfolio_reflection?: string
    }>(event)

    // Verify the application belongs to the user and is completed
    const application = await prisma.application.findFirst({
      where: {
        application_id: Number(applicationId),
        user_id: Number(user_id),
        status: 'Completed'
      }
    })

    if (!application) {
      return createError({ 
        statusCode: 404, 
        statusMessage: 'Completed application not found or you do not have permission' 
      })
    }

    // Update portfolio settings
    const updated = await prisma.application.update({
      where: { application_id: Number(applicationId) },
      data: {
        portfolio_visible: body.portfolio_visible ?? application.portfolio_visible,
        portfolio_reflection: body.portfolio_reflection ?? application.portfolio_reflection
      },
      include: {
        job: {
          select: {
            title: true,
            category: true
          }
        }
      }
    })

    return {
      success: true,
      application: updated
    }
  } catch (err) {
    console.error('Error updating portfolio settings:', err)
    return createError({ statusCode: 500, statusMessage: 'Failed to update portfolio settings' })
  } finally {
    await prisma.$disconnect()
  }
})
