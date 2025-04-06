import { NextApiRequest } from "next";
import jwt from "jsonwebtoken";

export const getAuthUser = async (req: NextApiRequest) => {
  const token = req.cookies.token; // Eğer HttpOnly cookie kullanıyorsanız
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as { id: number };
    return { id: decoded.id };
  } catch (err) {
    return null;
  }
};
