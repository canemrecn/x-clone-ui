// src/app/api/users/followers/route.ts
/*Bu dosya, verilen kullanıcı adına (username) göre o kullanıcıyı takip eden kişileri (takipçilerini) listeleyen bir GET API endpoint’idir. 
Önce kullanıcı adı searchParams üzerinden alınır ve geçerli olup olmadığı kontrol edilir. Ardından, veritabanında follows tablosu üzerinden 
bu kullanıcıyı takip eden kullanıcıların bilgileri (id, full_name, username, profile_image) çekilir ve JSON olarak döndürülür. Herhangi 
bir hata durumunda uygun bir hata mesajı ve 500 sunucu hatası yanıtı verilir.*/
// src/app/api/users/followers/route.ts
// src/app/api/users/followers/route.ts
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

    // "follows" tablosu ile kullanıcının takipçilerini almak için sorgu
    const query = `
      SELECT u.id, u.full_name, u.username, u.profile_image
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = (SELECT id FROM users WHERE username = ?)
    `;

    // Veritabanı sorgusunun çalıştırılması
    const [rows] = await db.query<RowDataPacket[]>(query, [username]);

    if (rows.length === 0) {
      return NextResponse.json({ message: "No followers found for this username." }, { status: 404 });
    }

    // Başarıyla takipçileri döndürüyoruz
    return NextResponse.json({ followers: rows }, { status: 200 });
  } catch (error: any) {
    console.error("Followers fetch error:", error);
    return NextResponse.json(
      { message: "Error fetching followers", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
