import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: Request) {
  try {
    // URL'den query parametrelerini alıyoruz
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    if (!username) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }

    // Örnek sorgu:
    // "follows" tablosunda, following_id kullanıcının id'sini,
    // follower_id ise takip eden kişilerin id'sini temsil ediyor.
    // Bu sorguda, önce kullanıcının id'sini alt sorgu ile alıp,
    // ardından takip eden kullanıcıların bilgilerini getiriyoruz.
    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT u.id, u.full_name, u.username, u.profile_image
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = (SELECT id FROM users WHERE username = ?)
      `,
      [username]
    );

    return NextResponse.json({ followers: rows }, { status: 200 });
  } catch (error) {
    console.error("Followers fetch error:", error);
    return NextResponse.json({ message: "Error fetching followers" }, { status: 500 });
  }
}
