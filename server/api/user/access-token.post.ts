import { PrismaClient } from "@prisma/client"
export default defineEventHandler(async (event) => {
  try {
    const prisma = new PrismaClient()
    const cookie = getCookie(event, "authorization")
    
    if(!cookie) return createError({ statusCode: 401, statusMessage: "User is not authorized" })


    const decodedToken = verifyToken(cookie)  
    if(!decodedToken) return createError({ statusCode: 401, statusMessage: "User session is not valid" })

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        user_id: decodedToken.id
      }
    })
    if(!user) return createError({ statusCode: 404, statusMessage: "User not found" })

    const token = signToken({ id: user.user_id })    
    return token
    
  } catch (error) {
    console.log(error);
    
    return createError({ statusCode: 500, statusMessage: "Internal Server Error" })
  }
})