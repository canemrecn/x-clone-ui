// src/app/api/admin/delete-comment/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json({ message: "Yorum ID'si gerekli." }, { status: 400 });
    }

    // Kullanıcı için Yorum Silme
    const result: any = await db.query(
      `DELETE FROM comments WHERE id = ?`,
      [commentId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Yorum bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ message: "Yorum başarıyla silindi" }, { status: 200 });

  } catch (error: any) {
    console.error("Yorum silme hatası:", error);
    return NextResponse.json({ message: "Yorum silme hatası", error: error.message }, { status: 500 });
  }
}
