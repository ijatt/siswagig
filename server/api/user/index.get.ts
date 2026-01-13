import { PrismaClient, Prisma } from "@prisma/client";

export default defineEventHandler(async (event) => {
  try {
    const userID = await checkAccessToken(event);

    if (!userID) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
      where: {
        user_id: userID as number,
      },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    return user;
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
