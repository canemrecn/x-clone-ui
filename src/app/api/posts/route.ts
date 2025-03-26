// src/app/api/posts/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const postId = searchParams.get("post_id");
    const lang = searchParams.get("lang");

    let query = `
      SELECT 
        p.id,
        p.user_id,
        p.title,
        p.content,
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

    if (postId) {
      conditions.push("p.id = ?");
      queryParams.push(postId);
    }
    if (userId) {
      conditions.push("p.user_id = ?");
      queryParams.push(userId);
    }
    if (lang) {
      conditions.push("p.lang = ?");
      queryParams.push(lang);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY p.created_at DESC";

    const [rows] = await db.query<RowDataPacket[]>(query, queryParams);
    return NextResponse.json({ posts: rows }, { status: 200 });
  } catch (error) {
    console.error("Gönderiler alınırken hata oluştu:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
