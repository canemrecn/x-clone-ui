import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.toLowerCase();

  if (!query || query.length < 1) {
    return NextResponse.json({ tags: [] });
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT LOWER(SUBSTRING_INDEX(SUBSTRING_INDEX(content, '#', -1), ' ', 1)) AS tag,
             COUNT(*) AS count
      FROM posts
      WHERE content LIKE ?
      GROUP BY tag
      HAVING tag LIKE ?
      ORDER BY count DESC
      LIMIT 10
      `,
      [`%#${query}%`, `${query}%`]
    );

    return NextResponse.json({ tags: rows });
  } catch (err) {
    console.error("Hashtag search error:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
