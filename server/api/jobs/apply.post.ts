import { PrismaClient } from "@prisma/client"
interface Application {
  id: string;
  job_id: number;
  user_id: number;
  status: string;
  created_at: string;
  cover_letter: string;
  price: number;
  duration: Date;
}

export default defineEventHandler(async (event) => {
  console.log("masuk");
  
  const prisma = new PrismaClient()
  try {
    const body = await readBody<Application>(event)

    const application = await prisma.application.create({
      data: {
        job_id: body.job_id,
        user_id: body.user_id,
        cover_letter: body.cover_letter,
        status: "Pending",
        price_offered: body.price,
        estimated_completion: new Date(body.duration),
      }
    })

    if (!application) return createError({  statusCode: 500, statusMessage: "Error creating application." })
    return application

  } catch (error) {
    return createError({ statusCode: 500, statusMessage: error instanceof Error ? error.message : "Unknown error" })
  }
})
