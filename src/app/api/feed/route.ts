// src/app/api/feed/route.ts
import { NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = user.id;

  try {
    const [followingRows] = await db.execute(
      `SELECT p.*, u.username, u.full_name, u.profile_image
       FROM posts p
       INNER JOIN follows f ON f.following_id = p.user_id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE f.follower_id = ?
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [userId]
    );

    const [popularRows] = await db.execute(
      `SELECT p.*, u.username, u.full_name, u.profile_image,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) +
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS popularity_score
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY popularity_score DESC
       LIMIT 40`
    );

    const [randomRows] = await db.execute(
      `SELECT p.*, u.username, u.full_name, u.profile_image
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY RAND()
       LIMIT 10`
    );

    const followingPosts = followingRows as any[];
    const popularPosts = popularRows as any[];
    const randomPosts = randomRows as any[];

    const merged = [...followingPosts, ...popularPosts, ...randomPosts];
    const uniquePosts = Array.from(
      new Map(merged.map((p) => [p.id, p])).values()
    );

    return NextResponse.json({ posts: uniquePosts });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
