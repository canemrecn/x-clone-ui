// src/app/api/admin/get-post/route.ts
// src/app/api/admin/get-post/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId'); // URL'den postId alınır

    if (!postId) {
      return NextResponse.json({ message: "Gönderi ID'si gerekli" }, { status: 400 });
    }

    // Veritabanından postId ile ilgili gönderiyi al
    const [rows]: any[] = await db.query(`SELECT * FROM posts WHERE id = ?`, [postId]);

    if (rows.length === 0) {
      return NextResponse.json({ message: "Gönderi bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ post: rows[0] }, { status: 200 });

  } catch (error: unknown) {
    console.error("Hata:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: "Veritabanı hatası", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Bilinmeyen hata", error: "Bilinmeyen hata" }, { status: 500 });
  }
}
