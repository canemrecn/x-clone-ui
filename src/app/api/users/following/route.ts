// src/app/api/users/following/route.ts
/*Bu dosya, belirli bir kullanıcı adının (username) takip ettiği kişileri listeleyen bir GET API endpoint’idir. İstek URL'sinden 
username parametresi alınır, geçerli ve boş olmadığından emin olunur. Daha sonra veritabanındaki follows tablosu kullanılarak, 
bu kullanıcının takip ettiği kişilerin (following_id) bilgileri (id, full_name, username, profile_image) çekilir ve istemciye 
JSON formatında döndürülür. Hatalı parametre veya sunucu hatasında uygun hata mesajı ile yanıt verilir.*/
// src/app/api/users/following/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    // Authorization header kontrolü
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Token temizleniyor
    const token = authHeader.split(" ")[1].trim();

    // JWT_SECRET kontrol edilir
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    // Token doğrulaması yapılır ve kullanıcı ID'si alınır
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // URL parametresinden username alınır
    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get("username");

    // Kullanıcı adı kontrolü
    if (!rawUsername) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }

    // Kullanıcı adı temizleniyor
    const username = rawUsername.trim();
    if (!username) {
      return NextResponse.json({ message: "Username cannot be empty" }, { status: 400 });
    }

    // Kullanıcı adını doğrulamak için user_id'yi çekiyoruz
    const [userRows] = await db.query<RowDataPacket[]>(`
      SELECT id FROM users WHERE username = ?
    `, [username]);

    // Eğer kullanıcı bulunamazsa 404 hatası döndürülür
    if (userRows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userIdToCheck = userRows[0].id;

    // Kullanıcıyı takip eden kişileri sorguluyoruz
    const [followingRows] = await db.query<RowDataPacket[]>(`
      SELECT u.id, u.full_name, u.username, u.profile_image
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
    `, [userIdToCheck]);

    return NextResponse.json({ following: followingRows }, { status: 200 });
  } catch (error: any) {
    console.error("Following fetch error:", error);
    return NextResponse.json({ message: "Error fetching following", error: error.message || "Unknown error" }, { status: 500 });
  }
}
