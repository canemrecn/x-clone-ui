// src/app/api/feed/route.ts
import { NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = user.id;

  try {
    const [followingPosts] = await db.execute(
      `SELECT p.* FROM posts p
       INNER JOIN follows f ON f.following_id = p.user_id
       WHERE f.follower_id = ?
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [userId]
    );

    const [popularPosts] = await db.execute(
      `SELECT p.*,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) +
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS popularity_score
       FROM posts p
       ORDER BY popularity_score DESC
       LIMIT 40`
    );

    const [randomPosts] = await db.execute(
      `SELECT * FROM posts
       ORDER BY RAND()
       LIMIT 10`
    );

    // Birleştir ve sırala
    const combined = [...(followingPosts as any[]), ...(popularPosts as any[]), ...(randomPosts as any[])];

    return NextResponse.json({ posts: combined });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
