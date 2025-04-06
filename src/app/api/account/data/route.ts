// src/app/api/account/data/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Kullanıcı temel bilgileri
    const [user] = await db.query<RowDataPacket[]>(
      "SELECT id, full_name, username, email, profile_image, points, level, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Gönderiler
    const [posts] = await db.query<RowDataPacket[]>(
      "SELECT id, title, content, created_at FROM posts WHERE user_id = ?",
      [userId]
    );

    // Yorumlar
    const [comments] = await db.query<RowDataPacket[]>(
      "SELECT id, post_id, text, created_at FROM comments WHERE user_id = ?",
      [userId]
    );

    // Beğeniler
    const [likes] = await db.query<RowDataPacket[]>(
      "SELECT post_id, created_at FROM likes WHERE user_id = ?",
      [userId]
    );

    // Okunan kelimeler
    const [readWords] = await db.query<RowDataPacket[]>(
      "SELECT word, created_at FROM read_words WHERE user_id = ?",
      [userId]
    );

    // Mesajlar
    const [messages] = await db.query<RowDataPacket[]>(
      "SELECT receiverId, message, created_at FROM dm_messages WHERE senderId = ?",
      [userId]
    );

    // Log kayıtları
    const [logs] = await db.query<RowDataPacket[]>(
      "SELECT action, details, ip_address, user_agent, created_at FROM activity_logs WHERE user_id = ?",
      [userId]
    );

    return NextResponse.json({
      user: user[0],
      posts,
      comments,
      likes,
      readWords,
      messages,
      logs,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Veri çekme hatası:", error);
    return NextResponse.json({ message: "Sunucu hatası", error: error.message }, { status: 500 });
  }
}
