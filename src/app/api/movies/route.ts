// src/app/api/movies/route.ts
//Bu dosya, film verilerini yöneten bir API endpoint’idir (/api/movies) ve iki işlemi destekler: 
//POST isteğiyle gelen title, poster ve description alanlarını doğrulayıp temizleyerek movies 
//tablosuna yeni bir film kaydı ekler; GET isteğiyle ise veritabanındaki tüm filmleri çekip rastgele 
//bir tanesini seçerek başlık, poster ve açıklama bilgileriyle birlikte döner. Eksik veri, bulunamayan 
//film veya sunucu hatalarında uygun mesaj ve durum kodu ile yanıt verir.
// src/app/api/movies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Film yükleme (POST)
export async function POST(req: NextRequest) {
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;

    const secret = process.env.JWT_SECRET;
    if (!token || !secret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, secret) as { id: number };

    const body = await req.json();
    const { title, poster, description } = body;

    if (!title || !poster || !description) {
      return NextResponse.json({ message: "Eksik veri" }, { status: 400 });
    }

    const query = `INSERT INTO movies (title, poster, description) VALUES (?, ?, ?)`;
    await db.query(query, [title, poster, description]);

    return NextResponse.json({ message: "Film başarıyla yüklendi" }, { status: 200 });
  } catch (err: any) {
    console.error("Film yükleme hatası:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

// Film getirme (GET)
export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM movies ORDER BY RAND() LIMIT 1");
    const movie = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    if (!movie) {
      return NextResponse.json({ message: "Hiç film yok" }, { status: 404 });
    }

    return NextResponse.json(movie, { status: 200 });
  } catch (error: any) {
    console.error("Film getirme hatası:", error);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
