// src/app/api/users/route.ts
/*Bu dosya, JWT ile kimliği doğrulanmış kullanıcının karşılıklı olarak (mutual) takip ettiği kullanıcıları ve bu kullanıcılardan gelen okunmamış 
direkt mesaj (DM) sayısını sorgulayan bir GET API endpoint’idir. users tablosundan mutual takip ilişkisi olan kullanıcılar çekilir ve her 
kullanıcı için dm_messages tablosundan okunmamış mesaj sayısı kontrol edilerek hasNewMessage bilgisi hesaplanır. Sonuç olarak, mutual takip 
edilen kullanıcıların kimlikleri, kullanıcı adları, profil resimleri ve yeni mesaj olup olmadığı bilgisi JSON olarak döndürülür.*/
// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // cookies fonksiyonunu import et
import { getRefreshToken } from "@/lib/auth"; // Refresh token alabilmek için fonksiyon ekleyin

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization header missing or invalid" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1].trim();

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    let decoded;
    try {
      decoded = jwt.verify(token, secret) as { id: number };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        const cookieStore = await cookies(); 
        const refreshToken = cookieStore.get("refreshToken")?.value; 
        if (!refreshToken) {
          return NextResponse.json({ message: "Refresh token missing" }, { status: 401 });
        }

        const newAccessToken = await getRefreshToken(refreshToken);
        if (!newAccessToken) {
          return NextResponse.json({ message: "Unable to refresh token" }, { status: 401 });
        }

        decoded = jwt.verify(newAccessToken, secret) as { id: number };
      } else {
        throw err;
      }
    }

    const myId = decoded.id;

    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.profile_image,
        (
          SELECT COUNT(*) 
          FROM dm_messages dm
          WHERE dm.senderId = u.id
            AND dm.receiverId = ?
            AND dm.isRead = 0
        ) AS unreadCount
      FROM users u
      JOIN follows f1 ON f1.follower_id = ? AND f1.following_id = u.id
      JOIN follows f2 ON f2.follower_id = u.id AND f2.following_id = ?
      WHERE u.id != ?
    `;

    const [rows] = await db.query<RowDataPacket[]>(query, [myId, myId, myId, myId]);

    const result = rows.map((r) => ({
      id: r.id,
      username: r.username,
      profile_image: r.profile_image,
      hasNewMessage: r.unreadCount > 0,
    }));

    return NextResponse.json({ users: result }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error fetching mutual-follow users:", error);
    return NextResponse.json({ message: error.message || "An error occurred while fetching mutual follow users" }, { status: 500 });
  }
}
