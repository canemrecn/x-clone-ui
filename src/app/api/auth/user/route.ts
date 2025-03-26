// src/app/api/auth/user/route.ts
// src/app/api/auth/user/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(req: Request) {
  try {
    // Authorization header kontrolü
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Token değeri trim edilerek gereksiz boşluklardan arındırılıyor
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not defined!");
    }

    // JWT token doğrulaması ve kullanıcı ID'sinin alınması
    const decoded = jwt.verify(token, secret) as { id: number };
    if (!decoded || typeof decoded.id !== "number") {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
    }

    // Kullanıcının detaylı bilgilerini çekmek için sorgu
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT
        u.id,
        u.full_name,
        u.username,
        ul.level, -- level, user_levels görünümünden geliyor
        u.points,
        u.profile_image,
        u.joined_date,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS follower_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count
      FROM users u
      LEFT JOIN user_levels ul ON u.id = ul.id
      WHERE u.id = ?
      LIMIT 1
    `, [decoded.id]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // (Performans önerisi: "follows" tablosundaki follower_id ve following_id sütunlarına indeks eklenmesi sorgu performansını artırabilir.)

    return NextResponse.json({ user: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
