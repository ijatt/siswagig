interface JobCreate {
  title: string;
  description: string;
  category: string;
  location: string;
  budget: number;
  deadline: Date;
  image_url: string;
  user_id: number
}
import { PrismaClient, Prisma } from "@prisma/client";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<JobCreate>(event);

    const primsa = new PrismaClient();
    const job = await primsa.job.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        location: body.location,
        budget: body.budget,
        deadline: body.deadline,
        image_url: body.image_url,
        status: "Available",
        user_id: body.user_id as number,
      },
    });

    if (!job)
      return createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
      });

    return job;
  } catch (error) {
    return createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
