// src/app/api/follows/status/route.ts
//Bu dosya, bir kullanıcının başka bir kullanıcıyı takip edip etmediğini kontrol eden bir API endpoint’idir 
//(/api/follows/status, GET methodu); URL üzerinden gelen user_id ve following_id parametrelerini alır, 
//sayısal geçerliliklerini kontrol ettikten sonra follows tablosunda bu takip ilişkisinin olup 
//olmadığını sorgular ve sonucu { isFollowing: true/false } şeklinde döner. Eksik veya geçersiz 
//parametrelerde ya da sunucu hatalarında uygun hata mesajı ve durum kodu ile yanıt verir.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const following_id = searchParams.get("following_id");

    if (!user_id || !following_id) {
      return NextResponse.json({ message: "Missing parameters" }, { status: 400 });
    }

    const userId = Number(user_id.trim());
    const followingId = Number(following_id.trim());
    if (isNaN(userId) || isNaN(followingId)) {
      return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const currentUserId = decoded.id;

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1",
      [currentUserId, followingId]
    );

    return NextResponse.json({ isFollowing: rows.length > 0 }, { status: 200 });
  } catch (error) {
    console.error("Error fetching follow status:", error);
    return NextResponse.json({ message: "Server error", error: String(error) }, { status: 500 });
  }
}
