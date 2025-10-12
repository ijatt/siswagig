import JWT from "jsonwebtoken";

export const signToken = (payload: Object): string => {
  const token = JWT.sign(payload, useRuntimeConfig().SECRET_KEY, {
    expiresIn: "10h"
  });

  return token;
}