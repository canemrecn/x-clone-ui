// src/app/api/dm_messages/unreadCount/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  try {
    // 1) Authorization header (Bearer token) kontrolü
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Token değerini trim ederek temizliyoruz
    const token = authHeader.split(" ")[1].trim();

    // 2) JWT doğrulama
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // 3) Veritabanında, bu kullanıcının "okunmamış" DM mesajlarını say
    const query = `
      SELECT COUNT(*) AS unreadCount
      FROM dm_messages
      WHERE receiverId = ?
        AND (isRead = 0 OR isRead IS NULL)
    `;
    const [rows] = await db.query<RowDataPacket[]>(query, [userId]);
    const unreadCount = rows?.[0]?.unreadCount || 0;

    // 4) Sonucu döndür
    return NextResponse.json({ unreadCount }, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching unread DM count:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
