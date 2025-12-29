import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()

  try {
    const user_id = await checkAccessToken(event)
    if (!user_id) return createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    // Fetch all applications by this freelancer that are hired or in progress
    const applications = await prisma.application.findMany({
      where: {
        user_id: Number(user_id),
        status: {
          in: ['Hired', 'In Progress', 'Submitted', 'Completed', 'Revision']
        }
      },
      include: {
        job: {
          include: {
            user: {
              select: {
                user_id: true,
                name: true,
                image_url: true,
                location: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return applications
  } catch (err) {
    console.error(err)
    return createError({ statusCode: 500, statusMessage: 'Unable to fetch active jobs' })
  }
})
