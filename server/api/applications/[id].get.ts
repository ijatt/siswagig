import { PrismaClient } from "@prisma/client"

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  
  try {
    const { id } = event.context.params as { id: string };
    const application_id = Number(id);

    const application = await prisma.application.findUnique({
      where: {
        application_id: application_id
      },
      include: ({
        user: {
          select: {
            name: true,
            image_url: true,
            user_id: true,
            userSkills: {
              select: {
                skill: true
              }
            }
          }
        },
        job: {
          include: {
            user: {
              select: {
                name: true,
                image_url: true,
                user_id: true
              }
            }
          }
        }
      } as any)
    })
    if (!application) return createError({ statusCode: 404, statusMessage: "No application found" })

    return application
  } catch (error) {
      return createError({ statusCode: 500, statusMessage: "Internal server error" })
  }
})
