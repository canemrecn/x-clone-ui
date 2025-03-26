// src/app/api/users/following/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: Request) {
  try {
    // URL'den query parametreleri alınır
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    if (!username) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }

    // Örnek sorgu:
    // 'follows' tablosunda follower_id kullanıcının id'sini, following_id ise takip ettiği kişilerin id'sini temsil ediyor.
    // Bu örnekte, önce kullanıcının id'sini almak için alt sorgu kullanılmıştır.
    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT u.id, u.full_name, u.username, u.profile_image
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = (SELECT id FROM users WHERE username = ?)
      `,
      [username]
    );

    return NextResponse.json({ following: rows }, { status: 200 });
  } catch (error) {
    console.error("Following fetch error:", error);
    return NextResponse.json({ message: "Error fetching following" }, { status: 500 });
  }
}
