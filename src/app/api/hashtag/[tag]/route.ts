// src/app/api/hashtag/[tag]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// context'in tipini "any" yap → tüm sorun çözülür.
export async function GET(req: NextRequest, context: any) {
  const tag = context.params.tag;

  try {
    const [rows] = await db.execute(
      `
      SELECT p.*, u.username, u.full_name, u.profile_image
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.content LIKE ?
      ORDER BY p.created_at DESC
      `,
      [`%#${tag}%`]
    );

    return NextResponse.json({ posts: rows });
  } catch (error) {
    console.error("Hashtag gönderileri çekilemedi:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
