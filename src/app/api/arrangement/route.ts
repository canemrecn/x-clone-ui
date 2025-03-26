//src/app/api/arrangement/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");

    // Her durumda puana göre sıralıyoruz:
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

    if (!all) {
      // all parametresi yoksa sadece top 3
      query += " LIMIT 3";
    } else {
      // all parametresi varsa 100 kişi göster
      query += " LIMIT 100";
    }

    const [rows] = await db.query<RowDataPacket[]>(query);
    return NextResponse.json({ users: rows }, { status: 200 });
  } catch (error) {
    console.error("Arrangement error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
