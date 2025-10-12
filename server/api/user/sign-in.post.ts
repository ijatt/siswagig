import { PrismaClient, Prisma } from "@prisma/client" 

interface UserSignInRequest {
  email: string;
  password: string;
}

export default defineEventHandler(async (event) => {
  try {
    const prisma = new PrismaClient()
    const body = await readBody<UserSignInRequest>(event)

    if (body === null) {
      return createError({ statusCode: 400, statusMessage: "Bad Request" })
    }

    if (!prisma) {
      return createError({ statusCode: 500, statusMessage: "Internal Server Error" })
    }

    const user = await prisma.user.findFirstOrThrow({
      where: {
        email: body.email
      }
    })

    const isPasswordValid = await checkPassword(body.password, user.password)
    if (!isPasswordValid) {
      return createError({ statusCode: 400, statusMessage: "Invalid password" })
    }

    const token = signToken({ id: user.user_id })
    setCookie(event, 'authorization', token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 3)
    })

    return user.name

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return createError({ statusCode: 400, statusMessage: "User not found" })
      } else {
        return createError({ statusCode: 500, statusMessage: "Prisma Server Error" })
      }
    }
    console.log(error);
    
    return createError({ statusCode: 500, statusMessage: String(error) })
  }
})