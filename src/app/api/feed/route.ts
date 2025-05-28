// src/app/api/feed/route.ts

import { NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth";
import { db } from "@/lib/db";

// 🔀 Diziyi karıştırmak için yardımcı fonksiyon
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
    // 🟢 Takip edilen kişilerin gönderileri (%50)
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

    // 🔵 En popüler gönderiler (%40)
    const [popularRows] = await db.execute(
      `SELECT p.*, u.username, u.full_name, u.profile_image,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) +
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS popularity_score
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY popularity_score DESC
       LIMIT 40`
    );

    // 🟡 Rastgele gönderiler (%10)
    const [randomRows] = await db.execute(
      `SELECT p.*, u.username, u.full_name, u.profile_image
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY RAND()
       LIMIT 10`
    );

    // 🎯 Türleri belirle
    const followingPosts = shuffleArray(followingRows as any[]);
    const popularPosts = shuffleArray(popularRows as any[]);
    const randomPosts = shuffleArray(randomRows as any[]);

    // 🧩 Tüm gönderileri birleştir ve ID’ye göre benzersizleştir
    const merged = [...followingPosts, ...popularPosts, ...randomPosts];
    const uniquePosts = Array.from(
      new Map(merged.map((p) => [p.id, p])).values()
    );

    // 🔄 Karıştır (her yenilemede sıra farklı olsun)
    const shuffledPosts = shuffleArray(uniquePosts);

    return NextResponse.json({ posts: shuffledPosts });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
