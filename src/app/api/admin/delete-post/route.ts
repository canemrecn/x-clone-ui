// src/app/api/admin/delete-post/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ message: "Gönderi ID'si gerekli." }, { status: 400 });
    }

    // 1️⃣ Gönderiyi al
    const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM posts WHERE id = ?`, [postId]);
    const post = rows[0];

    if (!post) {
      return NextResponse.json({ message: "Gönderi bulunamadı" }, { status: 404 });
    }

    // 2️⃣ Arşivle
    await db.query(
      `INSERT INTO deleted_posts (id, user_id, category_id, title, content, media_url, media_type, created_at, deleted_at, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [post.id, post.user_id, post.category_id, post.title, post.content, post.media_url, post.media_type, post.created_at, "Yönetici tarafından silindi"]
    );

    // 3️⃣ Sil
    await db.query(`DELETE FROM posts WHERE id = ?`, [postId]);

    return NextResponse.json({ message: "Gönderi silindi ve arşivlendi" }, { status: 200 });

  } catch (error: any) {
    console.error("Silme hatası:", error);
    return NextResponse.json({ message: "Silme hatası", error: error.message }, { status: 500 });
  }
}
