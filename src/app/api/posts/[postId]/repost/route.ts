// src/app/api/posts/[postId]/repost/route.ts
//Bu dosya, bir gönderinin "repost" (yeniden paylaşım) yapılmasını sağlayan API endpoint’idir. JWT token 
//ile kimlik doğrulaması yapıldıktan sonra, orijinal gönderi veritabanından alınır; varsa kullanıcıdan 
//gelen ek içerikle birleştirilerek yeni bir gönderi olarak posts tablosuna kaydedilir. Yeni kayıt, 
//orijinal gönderinin repost_id'siyle ilişkilendirilir. Ayrıca, orijinal gönderi sahibine bir "repost" 
//bildirimi oluşturularak notifications tablosuna eklenir. Böylece içerik yeniden paylaşılır ve içerik 
//sahibine bilgi verilir.
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import type { RowDataPacket, OkPacket } from "mysql2/promise";

export async function POST(
  req: NextRequest,
  context: any // 🔥 Bu şekilde %100 çalışır, build hatasını engeller
) {
  try {
    const post_id = parseInt(context?.params?.postId?.trim?.() || "", 10);
    if (isNaN(post_id)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const { token: rawToken, content } = await req.json() as {
      token?: string;
      content?: string;
    };

    if (!rawToken) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }

    const token = rawToken.trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT user_id, category_id, title, content, media_url, media_type FROM posts WHERE id = ? LIMIT 1",
      [post_id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const original = rows[0];
    const newContent = `${original.content}\n\nRepost Message: ${content?.trim() ?? ""}`;

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

    await db.query(
      `INSERT INTO notifications (user_id, type, from_user_id, post_id)
       VALUES (?, 'repost', ?, ?)`,
      [original.user_id, userId, post_id]
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
