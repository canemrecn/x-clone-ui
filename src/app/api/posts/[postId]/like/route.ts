// src/app/api/posts/[postId]/like/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket, OkPacket } from "mysql2/promise";
import { updateUserPoints } from "@/utils/points";

interface Context {
  params: { postId: string };
}

export async function POST(request: Request, context: Context) {
  try {
    // URL parametrelerinden postId'yi alıyoruz ve temizleyip sayıya çeviriyoruz.
    const { postId } = context.params;
    if (!postId) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }
    const numericPostId = Number(postId.trim());
    if (isNaN(numericPostId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    // İstek gövdesinden token'ı alıyoruz.
    const { token: rawToken } = await request.json() as { token?: string };
    if (!rawToken) {
      return NextResponse.json({ message: "No token" }, { status: 401 });
    }
    const token = rawToken.trim();

    // JWT token doğrulaması
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined in environment variables");
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // "likes" tablosuna ekleme yapılıyor.
    // INSERT IGNORE kullanılarak aynı kullanıcının aynı gönderiyi tekrar beğenmesi engelleniyor.
    await db.query<OkPacket>(
      "INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)",
      [numericPostId, userId]
    );

    // Gönderi sahibini çekiyoruz.
    const [postRows] = await db.query<RowDataPacket[]>(
      "SELECT user_id FROM posts WHERE id = ?",
      [numericPostId]
    );
    if (!postRows || postRows.length === 0) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    const postOwnerId = postRows[0].user_id;

    // Gönderi sahibine 1 puan ekliyoruz.
    await updateUserPoints(postOwnerId, 1);

    // Bildirim ekleniyor: 
    // - Bildirim tipi "like", 
    // - Bildirimi oluşturan kullanıcı userId, 
    // - İlgili gönderi postId.
    await db.query(
      `INSERT INTO notifications (user_id, type, from_user_id, post_id) 
       VALUES (?, 'like', ?, ?)`,
      [postOwnerId, userId, numericPostId]
    );

    return NextResponse.json({ message: "Post liked" }, { status: 200 });
  } catch (error: any) {
    console.error("Like error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
