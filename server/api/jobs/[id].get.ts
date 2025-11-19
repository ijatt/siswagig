import { PrismaClient } from "@prisma/client"

export default defineEventHandler(async (event) => {
  console.log('masuk');
  
  const prisma = new PrismaClient()
  try {
      const { id } = event.context.params as { id: string };
      const job_id = Number(id);

      const job = await prisma.job.findUnique({
        where: {
          job_id: job_id
        },
        include: {
          user: {
            select: {
              user_id: true,
              name: true,
              location: true,
              image_url: true
            }
          }
        }
      })

      if (!job) return createError({
        statusCode: 404,
        message: "No job found"
      })

      return job
  } catch (error) {
    return createError({
      statusCode: 500,
      message: "Internal server error"
    })
  }
})
