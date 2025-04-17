// src/app/api/admin/delete-comment/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json({ message: "Yorum ID'si gerekli." }, { status: 400 });
    }

    // 1️⃣ Yorumu al
    const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM comments WHERE id = ?`, [commentId]);
    const comment = rows[0];

    if (!comment) {
      return NextResponse.json({ message: "Yorum bulunamadı" }, { status: 404 });
    }

    // 2️⃣ Arşivle
    await db.query(
      `INSERT INTO deleted_comments (id, post_id, user_id, text, created_at, deleted_at, reason)
       VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
      [comment.id, comment.post_id, comment.user_id, comment.text, comment.created_at, "Yönetici tarafından silindi"]
    );

    // 3️⃣ Sil
    await db.query(`DELETE FROM comments WHERE id = ?`, [commentId]);

    return NextResponse.json({ message: "Yorum silindi ve arşivlendi" }, { status: 200 });

  } catch (error: any) {
    console.error("Yorum silme hatası:", error);
    return NextResponse.json({ message: "Hata", error: error.message }, { status: 500 });
  }
}
