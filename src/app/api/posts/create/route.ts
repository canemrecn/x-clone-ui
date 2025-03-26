//src/app/api/posts/create/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token: rawToken, content, media_url, media_type, isReel, lang, category_id } = body;

    console.log("📌 Gelen API isteği:", {
      token: rawToken,
      content,
      media_url,
      media_type,
      isReel,
      lang,
      category_id,
    });

    // Gerekli alanlar kontrol ediliyor: token ve (content veya media_url) gereklidir.
    if (!rawToken || (!content && !media_url)) {
      console.log("🚨 Eksik alanlar:", { token: rawToken, content, media_url });
      return NextResponse.json({ message: "Text or media required" }, { status: 400 });
    }
    // Token temizleniyor
    const token = rawToken.toString().trim();

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    // JWT doğrulaması ve user_id alınması
    const decoded = jwt.verify(token, secret) as { id: number };
    const user_id = decoded.id;

    // category_id, lang için varsayılan değerler atanıyor, ayrıca category_id sayı olarak kontrol ediliyor
    const categoryId = category_id ? Number(category_id) : 1;
    if (isNaN(categoryId)) {
      return NextResponse.json({ message: "Invalid category_id" }, { status: 400 });
    }
    const title = "Untitled Post";
    const postLang = lang ? lang.toString().trim() : "en";

    console.log("📌 Veritabanına kaydedilen veri:", {
      user_id,
      content,
      media_url,
      media_type,
      isReel,
      lang: postLang,
      categoryId,
    });

    // Veritabanına kaydetme işlemi: Parametrik sorgu kullanılarak SQL enjeksiyonuna karşı güvenlik sağlanır.
    await db.query(
      `INSERT INTO posts (user_id, category_id, title, content, media_url, media_type, is_reel, lang)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        categoryId,
        title,
        content || "[Medya gönderisi]",
        media_url,
        media_type,
        isReel,
        postLang,
      ]
    );

    return NextResponse.json({ message: "Post created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("🚨 Database error:", error);
    return NextResponse.json({ message: "Database error", error: String(error) }, { status: 500 });
  }
}
