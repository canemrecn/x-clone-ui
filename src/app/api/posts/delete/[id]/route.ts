// src/app/api/posts/delete/[id]/route.ts
// src/app/api/posts/delete/[id]/route.ts

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, context: any) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const postId = Number(context?.params?.id);

    if (!token || isNaN(postId)) {
      return NextResponse.json({ message: "Geçersiz istek" }, { status: 400 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET tanımlı değil");

    const decoded = jwt.verify(token, secret) as { id: number; role: string };

    if (decoded.role !== "admin") {
      // Kullanıcının kendi gönderisi mi kontrol et
      const [rows]: any = await db.query(
        "SELECT user_id FROM posts WHERE id = ?",
        [postId]
      );
      if (!rows || rows.length === 0) {
        return NextResponse.json({ message: "Gönderi bulunamadı" }, { status: 404 });
      }

      const postOwnerId = rows[0].user_id;
      if (postOwnerId !== decoded.id) {
        return NextResponse.json({ message: "Bu gönderiyi silme yetkiniz yok" }, { status: 403 });
      }
    }

    await db.query(
      "UPDATE posts SET is_deleted = 1, deleted_at = NOW() WHERE id = ?",
      [postId]
    );

    // Aynı zamanda reports tablosundan da sil
    await db.query(
      "DELETE FROM reports WHERE post_id = ?",
      [postId]
    );

    return NextResponse.json({ message: "Gönderi başarıyla silindi." }, { status: 200 });
  } catch (err: any) {
    console.error("Silme hatası:", err);
    return NextResponse.json(
      { message: "Sunucu hatası", error: err.message },
      { status: 500 }
    );
  }
}
