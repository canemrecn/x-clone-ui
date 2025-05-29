import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows]: any = await db.execute(`
      SELECT content FROM posts
    `);

    const tagCount: Record<string, number> = {};

    for (const row of rows) {
      const matches = row.content.match(/#\w+/g);
      if (matches) {
        for (const tag of matches) {
          const lowerTag = tag.toLowerCase();
          tagCount[lowerTag] = (tagCount[lowerTag] || 0) + 1;
        }
      }
    }

    const sorted = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag, count]) => ({ tag: tag.slice(1), count }));

    return NextResponse.json({ topHashtags: sorted });
  } catch (error) {
    console.error("Hashtag analizi hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
