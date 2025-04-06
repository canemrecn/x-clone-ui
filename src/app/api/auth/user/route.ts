// src/app/api/auth/user/route.ts
//Bu dosya, kimliği doğrulanmış kullanıcının bilgilerini getiren bir API 
//endpoint’idir (/api/auth/user, GET methodu); JWT token'ı Authorization 
//başlığından alır, doğrulayıp kullanıcı ID’sini çözer, ardından bu ID’ye 
//ait kullanıcının ad, kullanıcı adı, seviye, puan, profil fotoğrafı, 
//katılım tarihi, takipçi ve takip edilen sayısı gibi bilgilerini 
//veritabanından çekerek JSON formatında döner. Hatalı token, eksik 
//bilgi veya sistem hatalarında uygun mesaj ve durum kodu ile yanıt verir.
// src/app/api/auth/user/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // ✅ EKLENDİ
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized - Token not found" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    if (!decoded || typeof decoded.id !== "number") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT u.id, u.full_name, u.username, ul.level, u.points, u.profile_image, u.joined_date,
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

    return NextResponse.json({ user: rows[0] }, { status: 200 });

  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
