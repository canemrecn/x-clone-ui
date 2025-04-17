// src/app/api/users/followers/route.ts
/*Bu dosya, verilen kullanıcı adına (username) göre o kullanıcıyı takip eden kişileri (takipçilerini) listeleyen bir GET API endpoint’idir. 
Önce kullanıcı adı searchParams üzerinden alınır ve geçerli olup olmadığı kontrol edilir. Ardından, veritabanında follows tablosu üzerinden 
bu kullanıcıyı takip eden kullanıcıların bilgileri (id, full_name, username, profile_image) çekilir ve JSON olarak döndürülür. Herhangi 
bir hata durumunda uygun bir hata mesajı ve 500 sunucu hatası yanıtı verilir.*/
// src/app/api/users/followers/route.ts
/* 
Bu dosya, belirli bir kullanıcı adının (username) takipçilerini listeleyen bir GET API endpoint’idir.
JWT token doğrulaması yapar, kullanıcıya ait takipçileri (followers) listeler.
*/

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { getAuthUserFromRequest } from "@/utils/getAuthUser";

export async function GET(request: Request) {
  try {
    // ✅ Auth kontrolü (HttpOnly cookie üzerinden)
    const user = await getAuthUserFromRequest();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ username parametresini al
    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get("username");

    if (!rawUsername) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }

    const username = rawUsername.trim();
    if (!username) {
      return NextResponse.json({ message: "Username cannot be empty" }, { status: 400 });
    }

    // ✅ kullanıcıyı veritabanında bul
    const [userRows] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userIdToCheck = userRows[0].id;

    // ✅ kullanıcıyı takip edenleri getir
    const [followers] = await db.query<RowDataPacket[]>(
      `
      SELECT u.id, u.full_name, u.username, u.profile_image
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      `,
      [userIdToCheck]
    );

    return NextResponse.json({ followers }, { status: 200 });

  } catch (error: any) {
    console.error("Followers fetch error:", error);
    return NextResponse.json(
      { message: "Error fetching followers", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
