// src/app/api/users/following/route.ts
/*Bu dosya, belirli bir kullanıcı adının (username) takip ettiği kişileri listeleyen bir GET API endpoint’idir. İstek URL'sinden 
username parametresi alınır, geçerli ve boş olmadığından emin olunur. Daha sonra veritabanındaki follows tablosu kullanılarak, 
bu kullanıcının takip ettiği kişilerin (following_id) bilgileri (id, full_name, username, profile_image) çekilir ve istemciye 
JSON formatında döndürülür. Hatalı parametre veya sunucu hatasında uygun hata mesajı ile yanıt verilir.*/
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { getAuthUser } from "@/utils/getAuthUser";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get("username");

    if (!rawUsername) {
      return NextResponse.json(
        { message: "Username is required" },
        { status: 400 }
      );
    }

    const username = rawUsername.trim();
    if (!username) {
      return NextResponse.json(
        { message: "Username cannot be empty" },
        { status: 400 }
      );
    }

    const [userRows] = await db.query<RowDataPacket[]>(
      `SELECT id FROM users WHERE username = ?`,
      [username]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userIdToCheck = userRows[0].id;

    const [followingRows] = await db.query<RowDataPacket[]>(
      `
      SELECT u.id, u.full_name, u.username, u.profile_image
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      `,
      [userIdToCheck]
    );

    return NextResponse.json({ following: followingRows }, { status: 200 });
  } catch (error: any) {
    console.error("Following fetch error:", error);
    return NextResponse.json(
      {
        message: "Error fetching following",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
