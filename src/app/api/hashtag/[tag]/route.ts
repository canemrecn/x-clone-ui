import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { tag: string } }) {
  const { tag } = params;
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
