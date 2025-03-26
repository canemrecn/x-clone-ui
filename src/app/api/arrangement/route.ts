//src/app/api/arrangement/route.ts
//src/app/api/arrangement/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");

    // Belirlenen "all" parametresine göre LIMIT değeri
    const limit = all ? 100 : 3;

    // Temel sorgu: Kullanıcıları puana göre azalan sıralamada çekiyoruz.
    let query = `
      SELECT
        id,
        full_name,
        username,
        points,
        profile_image
      FROM users
      ORDER BY points DESC
    `;

    // Prepared statement kullanılarak LIMIT değeri parametre olarak ekleniyor.
    query += " LIMIT ?";

    const [rows] = await db.query<RowDataPacket[]>(query, [limit]);
    
    return NextResponse.json(
      { users: rows },
      {
        status: 200,
        headers: {
          // Performans iyileştirmesi: CDN ve tarayıcı önbelleklemesi için Cache-Control
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Arrangement error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
