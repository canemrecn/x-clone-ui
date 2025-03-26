// src/app/api/posts/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Query parametrelerini alıp, temizliyoruz.
    const postIdParam = searchParams.get("post_id");
    const userIdParam = searchParams.get("user_id");
    const lang = searchParams.get("lang");

    // Temel sorgu: gönderi bilgileri ve yazar bilgileri
    let query = `
      SELECT 
        p.id,
        p.user_id,
        p.title,
        p.content,
        p.media_url,
        p.media_type,
        p.is_reel,
        p.created_at,
        p.lang,
        u.username,
        u.full_name,
        u.profile_image,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
        (SELECT COUNT(*) FROM posts WHERE repost_id = p.id) AS reposts_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
    `;

    const conditions: string[] = [];
    const queryParams: any[] = [];

    // Post ID parametresi varsa, sayıya çevirip kontrol ediyoruz.
    if (postIdParam) {
      const trimmedPostId = postIdParam.trim();
      const numericPostId = Number(trimmedPostId);
      if (isNaN(numericPostId)) {
        return NextResponse.json({ message: "Invalid post_id parameter" }, { status: 400 });
      }
      conditions.push("p.id = ?");
      queryParams.push(numericPostId);
    }

    // User ID parametresi varsa, sayıya çevirip kontrol ediyoruz.
    if (userIdParam) {
      const trimmedUserId = userIdParam.trim();
      const numericUserId = Number(trimmedUserId);
      if (isNaN(numericUserId)) {
        return NextResponse.json({ message: "Invalid user_id parameter" }, { status: 400 });
      }
      conditions.push("p.user_id = ?");
      queryParams.push(numericUserId);
    }

    // Dil parametresi varsa, doğrudan ekliyoruz.
    if (lang) {
      conditions.push("p.lang = ?");
      queryParams.push(lang.trim());
    }

    // Eğer istek doğrulanmışsa (token varsa), blok kontrolü ekleyelim.
    let myId: number | null = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1].trim();
      const secret = process.env.JWT_SECRET;
      if (secret) {
        try {
          const decoded = jwt.verify(token, secret) as { id: number };
          myId = decoded.id;
        } catch (err) {
          console.error("Token doğrulanamadı:", err);
        }
      }
    }
    if (myId !== null) {
      // NOT EXISTS kullanarak, eğer gönderi sahibinin (p.user_id) ile myId arasında blok ilişkisi varsa gönderiyi hariç tutuyoruz.
      conditions.push(`NOT EXISTS (
        SELECT 1 FROM blocks b
        WHERE (b.blocker_id = ? AND b.blocked_id = p.user_id)
           OR (b.blocker_id = p.user_id AND b.blocked_id = ?)
      )`);
      queryParams.push(myId, myId);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY p.created_at DESC";

    const [rows] = await db.query<RowDataPacket[]>(query, queryParams);
    console.log("📌 API'den dönen gönderiler:", rows);

    return NextResponse.json({ posts: rows }, { status: 200 });
  } catch (error: any) {
    console.error("Gönderiler alınırken hata oluştu:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
