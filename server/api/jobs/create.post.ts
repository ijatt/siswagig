interface JobCreate {
  title: string;
  description: string;
  category: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  budget: number;
  deadline: Date;
  image_url: string;
  user_id: number;
  requiredSkills: string;
}
import { PrismaClient, Prisma } from "@prisma/client";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<JobCreate>(event);

    const prisma = new PrismaClient();
    const job = await prisma.job.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        location: body.location,
        latitude: body.latitude,
        longitude: body.longitude,
        budget: body.budget,
        deadline: new Date(body.deadline),
        image_url: body.image_url,
        status: "Available",
        user_id: body.user_id as number,
        requiredSkills: body.requiredSkills,
      },
    });

    if (!job)
      return createError({
        statusCode: 500,
        message: "Failed to create job",
      });

    return job;
  } catch (error: any) {
    console.error("Job creation error:", error);
    
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return createError({
        statusCode: 400,
        message: `Database error: ${error.message} (Code: ${error.code})`,
      });
    }
    
    if (error instanceof Prisma.PrismaClientValidationError) {
      return createError({
        statusCode: 400,
        message: `Validation error: ${error.message}`,
      });
    }

    return createError({
      statusCode: 500,
      message: error?.message || "Internal Server Error",
    });
  }
});
