// src/app/api/users/cover-image/route.ts (örnek konum: users/[id]/followers/route.ts veya benzeri)
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: Request) {
  try {
    // URL'den query parametrelerini alıyoruz.
    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get("username");
    if (!rawUsername) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }
    // Kullanıcı adını trim edip temizliyoruz.
    const username = rawUsername.trim();
    if (!username) {
      return NextResponse.json({ message: "Username cannot be empty" }, { status: 400 });
    }

    // "follows" tablosunda, following_id kullanıcının id'sini,
    // follower_id ise takip eden kişilerin id'sini temsil ediyor.
    // İlk olarak, alt sorgu ile kullanıcının id'si alınır; ardından takip eden kullanıcıların bilgileri çekilir.
    const query = `
      SELECT u.id, u.full_name, u.username, u.profile_image
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = (SELECT id FROM users WHERE username = ?)
    `;
    const [rows] = await db.query<RowDataPacket[]>(query, [username]);

    return NextResponse.json({ followers: rows || [] }, { status: 200 });
  } catch (error: any) {
    console.error("Followers fetch error:", error);
    return NextResponse.json(
      { message: "Error fetching followers", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
