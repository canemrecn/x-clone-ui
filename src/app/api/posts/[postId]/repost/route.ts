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
    const post_id = parseInt(params.postId, 10);

    const { token, content } = await request.json();
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Orijinal gönderiyi çek
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT user_id, category_id, title, content, media_url, media_type FROM posts WHERE id = ?",
      [post_id]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    const original = rows[0];

    // Yeni gönderi içeriği: Orijinal içeriği + Repost mesajı
    const newContent = `${original.content}\n\nRepost Message: ${content || ""}`;

    // Repost ekle
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

    // Orijinal gönderi sahibine bildirim (type='repost')
    const originalOwnerId = original.user_id;
    await db.query(
      `INSERT INTO notifications (user_id, type, from_user_id, post_id)
       VALUES (?, 'repost', ?, ?)`,
      [originalOwnerId, userId, post_id]
    );

    return NextResponse.json(
      { message: "Reposted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Repost error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
