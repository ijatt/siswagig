import JWT from "jsonwebtoken";

interface Payload {
  id: number;
}

export const verifyToken = (token: string): Payload | false => {
  try {
    const payload = JWT.verify(token, useRuntimeConfig().SECRET_KEY);

    return payload as unknown as Payload;
  } catch (error) {
    return false;
  }
}