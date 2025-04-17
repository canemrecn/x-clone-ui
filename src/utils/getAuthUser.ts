// src/utils/getAuthUser.ts
import jwt from "jsonwebtoken";
import type { NextApiRequest } from "next";
import { cookies } from "next/headers";

// Pages Router için
export const getAuthUser = (req: NextApiRequest) => {
  const token = req.cookies?.token;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;

  try {
    const decoded = jwt.verify(token, secret) as { id: number };
    return { id: decoded.id };
  } catch (err) {
    return null;
  }
};

// App Router için (async hale getirildi)
export const getAuthUserFromRequest = async () => {
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) return null;

    const decoded = jwt.verify(token, secret) as { id: number };
    return { id: decoded.id };
  } catch (err) {
    return null;
  }
};
