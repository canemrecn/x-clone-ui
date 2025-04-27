//src/app/api/arrangement/route.ts
//Bu dosya, kullanıcıları puanlarına göre azalan sırada listeleyen 
//bir API endpoint’idir (/api/arrangement); istekte all parametresi 
//varsa 100, yoksa sadece 3 kullanıcıyı döner. MySQL sorgusu ile 
//id, full_name, username, points ve profile_image verilerini alır, 
//sonucu JSON formatında döner ve performans için önbellekleme 
//(Cache-Control) başlığı ekler. Hata durumunda ise 500 sunucu 
//hatası mesajı gönderir.
// src/app/api/arrangement/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");

    const limit = all ? 100 : 3;

    let query = `
      SELECT
        id,
        full_name,
        username,
        points,
        profile_image
      FROM users
      ORDER BY points DESC
      LIMIT ${Number(limit)}
    `;

    const [rows] = await db.query<RowDataPacket[]>(query);

    return NextResponse.json(
      { users: rows },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Arrangement error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
