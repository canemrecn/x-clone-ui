// src/utils/getAuthUser.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const getAuthUser = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const secret = process.env.JWT_SECRET;
    if (!token || !secret) return null;

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ? AND is_deleted = 0",
      [userId]
    );

    if (!rows || rows.length === 0) return null;

    return { id: userId };
  } catch (err) {
    return null;
  }
};

// Eski isimle çalışan yerler için alias (isteğe bağlı)
export { getAuthUser as getAuthUserFromRequest };
