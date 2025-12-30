import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  try {
    const client_id = await checkAccessToken(event)
    if (!client_id) return createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    // Fetch all jobs posted by this client with their applications
    const jobs = await prisma.job.findMany({
      where: {
        user_id: Number(client_id)
      },
      include: {
        applications: {
          include: {
            user: {
              select: {
                user_id: true,
                name: true,
                image_url: true,
                location: true,
                bio: true
              }
            },
            payment: {
              select: {
                payment_id: true,
                status: true,
                amount: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return jobs
  } catch (err) {
    return createError({ statusCode: 500, statusMessage: 'Unable to fetch applications' })
  }
})
