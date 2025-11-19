import { PrismaClient, Prisma } from "@prisma/client";

export default defineEventHandler(async (event) => {
  try {
    const userID = await checkAccessToken(event);

    if (!userID)
      return createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });

    const primsa = new PrismaClient();
    const user = await primsa.user.findUnique({
      where: {
        user_id: userID as number,
      },
    });

    if (!user)
      return createError({
        statusCode: 404,
        statusMessage: "User not found",
      });

    return user;
  } catch (error) {
    return createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
