import { PrismaClient } from "@prisma/client"

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  try {
    const jobs = await prisma.job.findMany();

    if (!jobs) return createError({
      statusCode: 404,
      message: "No jobs found"
    })

    return jobs
  } catch (error) {
    return createError({
      statusCode: 500,
      message: "Internal server error"
    })
  }
})
