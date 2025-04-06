// src/app/api/admin/get-comment/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId'); // URL'den commentId alınır

    if (!commentId) {
      return NextResponse.json({ message: "Yorum ID'si gerekli" }, { status: 400 });
    }

    // Veritabanından commentId ile ilgili yorumu al
    const [rows]: any[] = await db.query(
      `SELECT * FROM comments WHERE id = ?`,
      [commentId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Yorum bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ comment: rows[0] }, { status: 200 });

  } catch (error: unknown) {
    console.error("Yorum alma hatası:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: "Veritabanı hatası", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Bilinmeyen hata", error: "Bilinmeyen hata" }, { status: 500 });
  }
}

