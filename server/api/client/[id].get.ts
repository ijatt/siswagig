import { PrismaClient } from "@prisma/client"

export default defineEventHandler(async (event) => {
  const primsa = new PrismaClient()

  try {
    const { id } = event.context.params as { id: string };
    const user_id = Number(id);

    const client = await primsa.user.findUnique({
      where: {
        user_id: user_id
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        bio: true,
        location: true,
        jobs: true
      },
    })

    if (!client) return createError({
      statusCode: 404,
      message: "No client found"
    })

    return client
  } catch (error) {
    return createError({
      statusCode: 500,
      message: "Internal server error"
    })
  }
})
