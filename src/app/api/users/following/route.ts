// src/app/api/users/following/route.ts
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
    // Kullanıcı adını temizleyip trim ediyoruz.
    const username = rawUsername.trim();
    if (!username) {
      return NextResponse.json({ message: "Username cannot be empty" }, { status: 400 });
    }

    // 'follows' tablosunda:
    // - follower_id: kullanıcının id'sini temsil eder (takip eden kişi),
    // - following_id: takip ettiği kişilerin id'sini temsil eder.
    // Alt sorgu ile verilen username'e sahip kullanıcının id'si alınır ve ardından takip ettiği kişilerin bilgileri çekilir.
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT u.id, u.full_name, u.username, u.profile_image
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = (SELECT id FROM users WHERE username = ?)
    `, [username]);

    return NextResponse.json({ following: rows }, { status: 200 });
  } catch (error: any) {
    console.error("Following fetch error:", error);
    return NextResponse.json({ message: "Error fetching following", error: error.message || "" }, { status: 500 });
  }
}
