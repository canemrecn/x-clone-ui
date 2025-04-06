// src/app/api/posts/repost/route.ts
/*Bu dosya, bir gönderiyi tekrar paylaşmak (repost) için POST /api/posts/repost endpoint'ini tanımlar. 
Gövdesinden gelen post_id ile orijinal gönderi veritabanından çekilir, JWT ile kimlik doğrulaması 
yapılır ve kullanıcı bu gönderiyi kendi adına yeniden paylaşır. Repost işlemi başarılı olursa, 
orijinal gönderi sahibine 0.05 puan eklenir ve puana göre seviyesi (Beginner, Intermediate, 
Advanced, Legend) güncellenir. İşlem sonunda başarılı yanıt döner, hata durumunda ilgili 
mesajla hata yanıtı verilir.*/
// src/app/api/posts/repost/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket, OkPacket } from "mysql2/promise";

export async function POST(req: Request) {
  try {
    // İstek gövdesinden post_id alınır ve sayıya dönüştürülür.
    const { post_id: rawPostId } = await req.json();
    if (!rawPostId) {
      return NextResponse.json({ message: "post_id is required" }, { status: 400 });
    }
    const post_id = Number(rawPostId);
    if (isNaN(post_id)) {
      return NextResponse.json({ message: "Invalid post_id" }, { status: 400 });
    }
    
    // Authorization header kontrolü ve token doğrulaması
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined in environment variables");
    const decoded = jwt.verify(token, secret) as { id: number };
    const user_id = decoded.id;

    // Orijinal gönderiyi çekiyoruz.
    const [rows] = await db.query<RowDataPacket[]>( 
      "SELECT user_id, category_id, title, content, media_url, media_type FROM posts WHERE id = ? LIMIT 1", 
      [post_id]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    const original = rows[0];

    // Yeni repost gönderisinin içeriğini oluşturuyoruz.
    const [insertResult] = await db.query<OkPacket>(
      `INSERT INTO posts (user_id, category_id, title, content, media_url, media_type, repost_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        original.category_id,
        original.title,
        original.content,
        original.media_url,
        original.media_type,
        post_id,
      ]
    );

    // Orijinal gönderi sahibini alıyoruz.
    const postOwnerId = original.user_id;

    // Gönderi sahibinin mevcut puan ve seviye bilgilerini çekiyoruz.
    const [userRows] = await db.query<RowDataPacket[]>( 
      "SELECT points, level FROM users WHERE id = ? LIMIT 1", 
      [postOwnerId]
    );
    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ message: "Post owner not found" }, { status: 404 });
    }

    // Puan güncellemesi: Orijinal gönderi sahibine repost başına 0.05 puan ekliyoruz.
    let currentPoints = Number(userRows[0].points) || 0;
    currentPoints += 0.05;

    // Seviye belirleme fonksiyonu
    function getLevel(points: number): string {
      if (points < 100) return "Beginner";
      if (points < 300) return "Intermediate";
      if (points < 500) return "Advanced";
      return "Legend";
    }
    const newLevel = getLevel(currentPoints);

    // Kullanıcı puanları ve seviyesi güncelleniyor.
    await db.query<OkPacket>(
      "UPDATE users SET points = ?, level = ? WHERE id = ?",
      [currentPoints, newLevel, postOwnerId]
    );

    return NextResponse.json({ message: "Reposted successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Repost error:", error);
    return NextResponse.json(
      { message: "Database error", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
