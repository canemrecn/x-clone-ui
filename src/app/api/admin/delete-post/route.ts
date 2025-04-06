// src/app/api/admin/delete-post/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Veritabanı bağlantısı

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { postId } = body;

    // Admin kontrolü yapılabilir
    const isAdmin = true; // Admin kontrolü yapılmalı

    if (!isAdmin) {
      return NextResponse.json({ message: "Yetkiniz yok" }, { status: 403 });
    }

    // Veritabanı sorgusuyla gönderiyi silme
    const result: any = await db.query(
      `DELETE FROM posts WHERE id = ?`,
      [postId]
    );

    if (result[0].affectedRows === 0) {
      return NextResponse.json({ message: "Gönderi bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ message: "Gönderi başarıyla silindi" }, { status: 200 });
  } catch (error: any) {
    console.error("Silme hatası:", error);
    return NextResponse.json({ message: "Silme hatası", error: error.message }, { status: 500 });
  }
}
