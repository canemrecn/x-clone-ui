// src/app/api/posts/[postId]/comment/[commentId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { db } from "@/lib/db"; // kendi veritabanı yoluna göre değiştir
import { RowDataPacket } from "mysql2";

// Yorum silme endpointi
export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string; commentId: string } }
) {
  const { postId, commentId } = params;
  const cookieStore = await cookies();
const token = cookieStore.get("token")?.value;


  if (!token) {
    return NextResponse.json({ message: "Token bulunamadı." }, { status: 401 });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userId = decoded.id;

    // Yorumu getir
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM comments WHERE id = ? AND post_id = ? AND is_deleted = 0`,
      [commentId, postId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Yorum bulunamadı." }, { status: 404 });
    }

    const comment = rows[0];

    if (comment.user_id !== userId) {
      return NextResponse.json({ message: "Bu yorumu silmeye yetkiniz yok." }, { status: 403 });
    }

    await db.query(`UPDATE comments SET is_deleted = 1 WHERE id = ?`, [commentId]);

    return NextResponse.json({ message: "Yorum başarıyla silindi." }, { status: 200 });
  } catch (error) {
    console.error("Silme hatası:", error);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
