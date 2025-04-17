// src/app/api/users/route.ts
/*Bu dosya, JWT ile kimliği doğrulanmış kullanıcının karşılıklı olarak (mutual) takip ettiği kullanıcıları ve bu kullanıcılardan gelen okunmamış 
direkt mesaj (DM) sayısını sorgulayan bir GET API endpoint’idir. users tablosundan mutual takip ilişkisi olan kullanıcılar çekilir ve her 
kullanıcı için dm_messages tablosundan okunmamış mesaj sayısı kontrol edilerek hasNewMessage bilgisi hesaplanır. Sonuç olarak, mutual takip 
edilen kullanıcıların kimlikleri, kullanıcı adları, profil resimleri ve yeni mesaj olup olmadığı bilgisi JSON olarak döndürülür.*/
// JWT doğrulamalı mutual takip ve okunmamış mesajları listeleyen API
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: Request) {
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;
    const secret = process.env.JWT_SECRET;
    if (!token || !secret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    const query = `
      SELECT 
        u.id,
        u.username,
        u.profile_image,
        (
          SELECT COUNT(*) 
          FROM dm_messages m
          WHERE m.senderId = u.id AND m.receiverId = ? AND m.isRead = 0
        ) AS unreadCount
      FROM users u
      JOIN follows f1 ON f1.follower_id = ? AND f1.following_id = u.id
      JOIN follows f2 ON f2.follower_id = u.id AND f2.following_id = ?
      WHERE u.id != ?
    `;

    const [rows] = await db.query<RowDataPacket[]>(query, [userId, userId, userId, userId]);

    const mutualUsers = rows.map((user) => ({
      id: user.id,
      username: user.username,
      profile_image: user.profile_image,
      hasNewMessage: user.unreadCount > 0,
    }));

    return NextResponse.json({ users: mutualUsers }, { status: 200 });
  } catch (error: any) {
    console.error("Mutual follow fetch error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
