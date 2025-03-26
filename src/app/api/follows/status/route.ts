// src/app/api/follows/status/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(req: Request) {
  try {
    // URL’den query parametrelerini alıyoruz.
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const following_id = searchParams.get("following_id");

    if (!user_id || !following_id) {
      return NextResponse.json({ message: "Missing parameters" }, { status: 400 });
    }

    // Parametreleri temizleyip sayıya çeviriyoruz
    const userId = Number(user_id.trim());
    const followingId = Number(following_id.trim());
    if (isNaN(userId) || isNaN(followingId)) {
      return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
    }

    // Takip ilişkisinin var olup olmadığını kontrol eden sorgu: SELECT 1 ve LIMIT 1 ile performans artışı sağlanır.
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1",
      [userId, followingId]
    );

    return NextResponse.json({ isFollowing: rows.length > 0 }, { status: 200 });
  } catch (error) {
    console.error("Error fetching follow status:", error);
    return NextResponse.json({ message: "Server error", error: String(error) }, { status: 500 });
  }
}
