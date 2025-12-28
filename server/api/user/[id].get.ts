import { PrismaClient, Prisma } from "@prisma/client";

export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params as { id: string };
    const userId = Number(id);

    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        bio: true,
        image_url: true,
        userSkills: {
          include: {
            skill: true,
          },
        },
        jobs: {
          select: {
            job_id: true,
            title: true,
          },
        },
      },
    });

    if (!user) {
      return createError({ statusCode: 404, statusMessage: "User not found" });
    }

    const formattedUser = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      image_url: user.image_url,
      userSkills: user.userSkills.map((us) => ({
        id: us.skill.skill_id,
        name: us.skill.name,
      })),
      jobs: user.jobs,
    };

    return formattedUser;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return createError({
          statusCode: 404,
          statusMessage: "User not found",
        });
      } else {
        return createError({
          statusCode: 500,
          statusMessage: "Prisma Server Error",
        });
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return createError({ statusCode: 500, statusMessage: errorMessage });
  }
});
