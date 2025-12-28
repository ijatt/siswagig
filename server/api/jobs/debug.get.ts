import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();

  try {
    const userId = await checkAccessToken(event);

    if (!userId) {
      return createError({
        statusCode: 401,
        message: "Unauthorized"
      });
    }

    // Get all jobs count
    const totalJobs = await prisma.job.count();

    // Get jobs by status
    const jobsByStatus = await prisma.job.groupBy({
      by: ["status"],
      _count: true
    });

    // Get user's jobs count
    const userJobs = await prisma.job.count({
      where: {
        user_id: userId as number
      }
    });

    // Get available jobs (excluding user's own)
    const availableJobs = await prisma.job.findMany({
      where: {
        NOT: {
          user_id: userId as number
        }
      },
      select: {
        job_id: true,
        title: true,
        status: true,
        requiredSkills: true
      },
      take: 5
    });

    return {
      debug: {
        totalJobs,
        userJobs,
        availableJobs: availableJobs.length,
        jobsByStatus,
        sampleJobs: availableJobs,
        userId
      }
    };
  } catch (error: any) {
    return createError({
      statusCode: 500,
      message: error?.message || "Internal server error"
    });
  }
});
