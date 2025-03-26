// src/app/api/posts/like/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket, OkPacket } from "mysql2/promise";

export async function POST(req: Request) {
  try {
    // İstek gövdesinden post_id alınır ve sayıya dönüştürülür.
    const { post_id: rawPostId } = await req.json();
    if (!rawPostId) {
      return NextResponse.json({ message: "post_id is required" }, { status: 400 });
    }
    const post_id = Number(rawPostId);
    if (isNaN(post_id)) {
      return NextResponse.json({ message: "Invalid post_id" }, { status: 400 });
    }

    // Authorization header kontrolü
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Bearer token ayrıştırması ve JWT doğrulaması
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const decoded = jwt.verify(token, secret) as { id: number };
    const user_id = decoded.id;

    // "likes" tablosuna, aynı kullanıcının aynı gönderiyi tekrar beğenmesini engellemek için INSERT IGNORE kullanılarak ekleme yapılır.
    await db.query<OkPacket>(
      "INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)",
      [post_id, user_id]
    );

    // Gönderi sahibini çekiyoruz.
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT user_id FROM posts WHERE id = ?",
      [post_id]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    const postOwnerId = rows[0].user_id;

    // (Opsiyonel) Gönderi sahibine puan eklenmesi veya seviye güncelleme yapılabilir.
    // Örneğin: await updateUserPoints(postOwnerId, 0.01);

    return NextResponse.json({ message: "Post liked" }, { status: 201 });
  } catch (error: any) {
    console.error("Like error:", error);
    return NextResponse.json({ message: "Database error", error: String(error) }, { status: 500 });
  }
}
