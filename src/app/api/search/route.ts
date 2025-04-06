// src/app/api/search/route.ts
/*Bu dosya, kullanıcıların kullanıcı adı (username) veya tam adlarına (full_name) göre arama yapabilmesini sağlayan 
GET /api/search endpoint’ini tanımlar. URL'den gelen query parametresi temizlenir ve SQL enjeksiyonuna karşı 
güvenli bir şekilde %query% formatında veritabanında aranır. Eşleşen ilk 10 kullanıcı id, username ve full_name 
bilgileriyle birlikte JSON formatında döndürülür.*/
// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    // URL parametrelerini alıyoruz.
    const { searchParams } = new URL(req.url);
    // Query parametresini trim ederek temizliyoruz.
    const rawQuery = searchParams.get("query") || "";
    const query = rawQuery.trim();

    // Kullanıcı aramasını gerçekleştiriyoruz.
    // Parametreli sorgu kullanılarak SQL enjeksiyonuna karşı korunuyoruz.
    const [rows] = await db.query(
      "SELECT id, username, full_name FROM users WHERE username LIKE ? OR full_name LIKE ? LIMIT 10",
      [`%${query}%`, `%${query}%`]
    );

    return NextResponse.json({ results: rows }, { status: 200 });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ message: "Server error", error: error.message || "" }, { status: 500 });
  }
}
