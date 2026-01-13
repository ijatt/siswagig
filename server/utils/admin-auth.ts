import { H3Event } from "h3";
import { PrismaClient } from "@prisma/client"

interface AdminUser {
  user_id: number;
  role: string;
}

export const checkAdminAccess = async (event: H3Event): Promise<AdminUser | null> => {
  try {
    const authorizationHeader = getHeader(event, "authorization");
    if (!authorizationHeader) return null;

    if (!authorizationHeader.startsWith("Bearer")) return null;

    const token = authorizationHeader.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload) return null;

    const prisma = new PrismaClient()
    const user = await prisma.user.findUnique({
      where: {
        user_id: payload.id
      },
      select: {
        user_id: true,
        role: true
      }
    })
    
    if (!user) return null
    if (user.role !== 'admin') return null

    return user;
  } catch (error) {
    return null;
  }
}
