import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    if (!username) {
      return NextResponse.json({ message: "No username param" }, { status: 400 });
    }

    // Kullanıcıyı veritabanından çekiyoruz
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT
        u.id,
        u.full_name,
        u.username,
        ul.level, -- level artık user_levels görünümünden geliyor
        u.points,
        u.profile_image,
        u.joined_date,
        u.profile_info,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS follower_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count
      FROM users u
      LEFT JOIN user_levels ul ON u.id = ul.id -- user_levels ile birleştirme
      WHERE u.username = ? -- ✅ 'u.username' olarak düzelttik
      LIMIT 1
    `, [username]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("get-by-username error:", error);
    return NextResponse.json({ message: "Server error", error: String(error) }, { status: 500 });
  }
}
