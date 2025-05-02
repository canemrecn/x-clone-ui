// src/utils/getAuthUser.ts
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import type { NextApiRequest } from "next";

export const getAuthUser = async (req: NextApiRequest) => {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;

    const cookies = parse(cookieHeader);
    const token = cookies.token;
    const secret = process.env.JWT_SECRET;
    if (!token || !secret) return null;

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, role FROM users WHERE id = ? AND is_deleted = 0",
      [userId]
    );

    if (!rows || rows.length === 0) return null;

    return {
      id: rows[0].id,
      role: rows[0].role,
    };
  } catch (err) {
    console.error("❌ getAuthUser error:", err);
    return null;
  }
};
