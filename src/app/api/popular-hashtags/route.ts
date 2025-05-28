import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT LOWER(SUBSTRING_INDEX(SUBSTRING_INDEX(content, '#', -1), ' ', 1)) AS tag, COUNT(*) AS count
      FROM posts
      WHERE content LIKE '%#%'
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 3
    `);

    return NextResponse.json({ tags: rows });
  } catch (err) {
    return NextResponse.json({ error: "Popüler etiketler getirilemedi" }, { status: 500 });
  }
}
