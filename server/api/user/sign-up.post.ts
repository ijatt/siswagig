import { PrismaClient } from "@prisma/client";
interface UserSignUp {
  name: string;
  email: string;
  password: string;
  role: string;
}

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  try {
    const body = await readBody<UserSignUp>(event);
    if (body == null) {
      return createError({statusCode: 400, statusMessage: "Bad Request"});
    }

    if (!prisma) {
      return createError({statusCode:500, statusMessage: "Prisma Error"});
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.email,
        password: await hashPassword(body.password),
        role: body.role
      }
    })

    return user.user_id
  } catch (error) {
    // if (error instanceof PrismaClient) {
    //   if (error.code === "P2002") {
    //     return createError({ statusCode: 400, statusMessage: "Email already exists" })
    //   } else {
    //     return createError({ statusCode: 500, statusMessage: "Internal Server Error" })
    //   }
    // }
  }
})