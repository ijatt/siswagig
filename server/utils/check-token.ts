import { H3Event } from "h3";
import { PrismaClient } from "@prisma/client"

export const checkAccessToken = async (event: H3Event): Promise<number | boolean> => {
  try {
    const authorizationHeader = getHeader(event, "authorization");
    if (!authorizationHeader) return false;

    if (!authorizationHeader.startsWith("Bearer")) return false;

    const token = authorizationHeader.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload) return false;

    const prisma = new PrismaClient()
    const user = await prisma.user.findUnique({
      where: {
        user_id: payload.id
      }
    })
    if (!user) return false

    return user.user_id;
  } catch (error) {
    return false;
  }
}