import { NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth";
import { db } from "@/lib/db";

// Yardımcı fonksiyon
function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export async function GET() {
  const user = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = user.id;

  try {
    // %50 takip edilenlerden
    const [followingRows] = await db.execute(
      `SELECT p.*, u.username, u.full_name, u.profile_image
       FROM posts p
       INNER JOIN follows f ON f.following_id = p.user_id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE f.follower_id = ? AND p.media_type = 'video'
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [userId]
    );

    // %40 popüler videolar
    const [popularRows] = await db.execute(
      `SELECT p.*, u.username, u.full_name, u.profile_image,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) +
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS popularity_score
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.media_type = 'video'
       ORDER BY popularity_score DESC
       LIMIT 40`
    );

    // %10 rastgele videolar
    const [randomRows] = await db.execute(
      `SELECT p.*, u.username, u.full_name, u.profile_image
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.media_type = 'video'
       ORDER BY RAND()
       LIMIT 10`
    );

    const merged = [
      ...shuffleArray(followingRows as any[]),
      ...shuffleArray(popularRows as any[]),
      ...shuffleArray(randomRows as any[]),
    ];

    const uniquePosts = Array.from(
      new Map(merged.map((p) => [p.id, p])).values()
    );

    const shuffledPosts = shuffleArray(uniquePosts);

    return NextResponse.json({ posts: shuffledPosts });
  } catch (error) {
    console.error("Reels API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
