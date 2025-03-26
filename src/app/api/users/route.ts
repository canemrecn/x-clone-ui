// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    // 1) Authorization: Bearer token kontrolü
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Token değeri trim edilerek temizleniyor.
    const token = authHeader.split(" ")[1].trim();

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    // 2) Token decode => userId
    const decoded = jwt.verify(token, secret) as { id: number };
    const myId = decoded.id;

    // 3) Mutual takip sorgusu: 
    // f1: benim -> u.id, f2: u.id -> benim
    // Ayrıca subquery ile dm_messages tablosundan okunmamış mesaj sayısı çekiliyor.
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.profile_image,
        (
          SELECT COUNT(*) 
          FROM dm_messages dm
          WHERE dm.senderId = u.id
            AND dm.receiverId = ?
            AND dm.isRead = 0
        ) AS unreadCount
      FROM users u
      JOIN follows f1 ON f1.follower_id = ? AND f1.following_id = u.id
      JOIN follows f2 ON f2.follower_id = u.id AND f2.following_id = ?
      WHERE u.id != ?
    `;

    // Parametreler: myId, myId, myId, myId
    const [rows] = await db.query<RowDataPacket[]>(query, [myId, myId, myId, myId]);

    // Sonuç: mutual takip edilen kullanıcılar + unreadCount bilgisi
    const result = rows.map((r) => ({
      id: r.id,
      username: r.username,
      profile_image: r.profile_image,
      hasNewMessage: r.unreadCount > 0,
    }));

    return NextResponse.json({ users: result }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error fetching mutual-follow users:", error);
    return NextResponse.json({ message: error.message || "Error fetching users" }, { status: 500 });
  }
}
