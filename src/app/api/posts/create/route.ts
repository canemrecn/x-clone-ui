// src/app/api/posts/create/route.ts
/*
Bu dosya, kullanıcıların yeni bir gönderi (metin, medya veya her ikisi) oluşturmasını sağlayan
bir API endpoint’idir. JWT token ile kullanıcının kimliği doğrulandıktan sonra gelen içerik,
medya bilgileri, dil ve kategori bilgileriyle birlikte posts tablosuna güvenli bir şekilde kaydedilir.
İçerik metni yoksa varsayılan olarak "Undergo" atanır.
Gönderi başarıyla oluşturulursa 201 yanıtı döner, aksi halde hata mesajı ile 500 döner.
*/

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

// Uygunsuz içerik kontrol listesi
const forbiddenWords = [
  "orospu", "piç", "şerefsiz", "kahpe", "pezevenk", "yarrak", "am", "amcık",
  "göt", "ananı", "sikeyim", "siktir", "kaltak", "ibne", "top", "kaşar",
  "aptal", "salak", "gerizekalı", "geri zekalı", "mal", "beyinsiz", "dangalak", "embesil",
  "öldür", "gebertirim", "vururum", "kan kustururum", "keserim", "boğarım", "yakarım",
  "terörist", "bomba", "patlat", "silah", "kurşun", "katliam", "cinayet", "kanlı",
  "fuck", "shit", "bitch", "asshole", "dick", "pussy", "slut", "whore", "rape", "kill",
  // Listeyi istersen daha da uzatabiliriz
];

// Metinde uygunsuz içerik tespiti
function detectInappropriate(text: string): string | null {
  const lower = text.toLowerCase();
  return forbiddenWords.find((word) => lower.includes(word)) || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, media_url, media_type, isReel, lang, category_id } = body;

    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    if (!content && !media_url) {
      return NextResponse.json({ message: "Content or media is required" }, { status: 400 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(token, secret) as { id: number };
    const user_id = decoded.id;
    const postLang = lang?.toString().trim() || "en";
    const categoryId = Number(category_id) || 1;
    const title = "Gönderiyi Göster";

    // AI filtresiyle içerik kontrolü
    const matchedWord = detectInappropriate(content || "") || detectInappropriate(media_url || "");
    if (matchedWord) {
      const [pendingResult] = await db.query(
        `INSERT INTO pending_posts (user_id, content, media_url, media_type, is_reel, lang, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [
          user_id,
          content || "Undergo",
          media_url,
          media_type,
          isReel ? 1 : 0,
          postLang,
        ]
      );

      await db.query(
        `INSERT INTO user_warnings (user_id, reason, triggered_by, severity)
         VALUES (?, ?, 'ai', 'high')`,
        [user_id, `Uygunsuz içerik algılandı: ${matchedWord}`]
      );

      return NextResponse.json(
        { message: "Gönderi AI filtresine takıldı, admin onayı bekliyor." },
        { status: 202 }
      );
    }

    // Gönderi kaydı
    const [postResult] = await db.query(
      `INSERT INTO posts (user_id, category_id, title, content, media_url, media_type, is_reel, lang)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        categoryId,
        title,
        content || "Undergo",
        media_url,
        media_type,
        isReel ? 1 : 0,
        postLang,
      ]
    );

    const ip = request.headers.get("x-forwarded-for") || "localhost";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await db.query(
      `INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [
        user_id,
        "post_created",
        `Post ID: ${(postResult as any).insertId}`,
        ip,
        userAgent,
      ]
    );

    return NextResponse.json({ message: "Post created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("🚨 Post Creation Error:", error);
    return NextResponse.json(
      { message: "Database error", error: error.message },
      { status: 500 }
    );
  }
}
