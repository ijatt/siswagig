import { PrismaClient } from "@prisma/client"

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  
  try {
    const { id } = event.context.params as { id: string };
    const user_id = Number(id);

    const applications = prisma.application.findMany({
      where: {
        user_id: user_id
      },
      include: {
        job: {
          include: {
            user: {
              select: {
                name: true,
                image_url: true
              }
            }
          }
        }
      }
    })

    if (!applications) return createError({ statusCode: 404, statusMessage: "No applications found" })

    return applications
  } catch (error) {
    return createError({ statusCode: 500, statusMessage: "Internal server error" })
  }
  
})
