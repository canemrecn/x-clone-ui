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
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { getAuthUser } from "@/utils/getAuthUser";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET method allowed" });
  }

  try {
    // ✅ Auth kontrolü
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rawUsername = req.query.username;
    if (!rawUsername || typeof rawUsername !== "string") {
      return res.status(400).json({ message: "Username is required and must be a string" });
    }

    const username = rawUsername.trim();
    if (!username) {
      return res.status(400).json({ message: "Username cannot be empty" });
    }

    // ✅ kullanıcıyı veritabanında bul
    const [userRows] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
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

    return res.status(200).json({ followers });
  } catch (error: any) {
    console.error("Followers fetch error:", error);
    return res.status(500).json({
      message: "Error fetching followers",
      error: error.message || "Unknown error",
    });
  }
}
