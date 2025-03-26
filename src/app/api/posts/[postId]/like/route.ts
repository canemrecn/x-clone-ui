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
    const params = await context.params; // `params` asenkron olarak çözülmeli
    const postId = params.postId; // Burada artık kullanılabilir

    if (!postId) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ message: "No token" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Beğeniyi ekle (Tekrarlanan beğenileri engelle)
    await db.query<OkPacket>(
      `INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)`,
      [postId, userId]
    );

    // Gönderi sahibini bul
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT user_id FROM posts WHERE id = ?",
      [postId]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    const postOwnerId = rows[0].user_id;

    // Gönderi sahibine 1 puan ekle
    await updateUserPoints(postOwnerId, 1);

    // **BİLDİRİM EKLE**
    await db.query(
      `INSERT INTO notifications (user_id, type, from_user_id, post_id) 
       VALUES (?, 'like', ?, ?)`,
      [postOwnerId, userId, postId]
    );

    return NextResponse.json({ message: "Post liked" }, { status: 200 });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
