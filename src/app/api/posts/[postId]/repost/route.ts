// src/app/api/posts/[postId]/repost/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket, OkPacket } from "mysql2/promise";

interface Context {
  params: { postId: string };
}

export async function POST(request: Request, { params }: Context) {
  try {
    // URL parametresinden postId alınarak sayısal değere dönüştürülüyor.
    const post_id = parseInt(params.postId.trim(), 10);
    if (isNaN(post_id)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    // İstek gövdesinden token ve isteğe bağlı repost mesajı (content) alınıyor.
    const { token: rawToken, content } = await request.json() as { token?: string, content?: string };
    if (!rawToken) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }
    const token = rawToken.trim();

    // JWT token doğrulaması yapılır.
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined in environment variables");
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Orijinal gönderi veritabanından çekiliyor. LIMIT 1 ekleyerek verimlilik artırılabilir.
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT user_id, category_id, title, content, media_url, media_type FROM posts WHERE id = ? LIMIT 1",
      [post_id]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    const original = rows[0];

    // Yeni gönderi içeriği, orijinal içeriğe repost mesajı eklenerek oluşturuluyor.
    // Eğer 'content' tanımlı değilse boş string olarak kabul edilir.
    const newContent = `${original.content}\n\nRepost Message: ${content ? content.trim() : ""}`;

    // Yeni repost gönderisi ekleniyor. repost_id, orijinal gönderinin ID'si olarak saklanıyor.
    const [insertResult] = await db.query<OkPacket>(
      `INSERT INTO posts (user_id, category_id, title, content, media_url, media_type, repost_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        original.category_id,
        original.title,
        newContent,
        original.media_url,
        original.media_type,
        post_id,
      ]
    );

    // Orijinal gönderi sahibine repost bildirimi ekleniyor.
    const originalOwnerId = original.user_id;
    await db.query(
      `INSERT INTO notifications (user_id, type, from_user_id, post_id)
       VALUES (?, 'repost', ?, ?)`,
      [originalOwnerId, userId, post_id]
    );

    return NextResponse.json({ message: "Reposted successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Repost error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
