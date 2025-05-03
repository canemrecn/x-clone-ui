// src/app/api/users/following/route.ts
/*Bu dosya, belirli bir kullanıcı adının (username) takip ettiği kişileri listeleyen bir GET API endpoint’idir. İstek URL'sinden 
username parametresi alınır, geçerli ve boş olmadığından emin olunur. Daha sonra veritabanındaki follows tablosu kullanılarak, 
bu kullanıcının takip ettiği kişilerin (following_id) bilgileri (id, full_name, username, profile_image) çekilir ve istemciye 
JSON formatında döndürülür. Hatalı parametre veya sunucu hatasında uygun hata mesajı ile yanıt verilir.*/
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { getAuthUser } from "@/utils/getAuthUser";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET method allowed" });
  }

  try {
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

    const [userRows] = await db.query<RowDataPacket[]>(
      `SELECT id FROM users WHERE username = ?`,
      [username]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
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

    return res.status(200).json({ following: followingRows });
  } catch (error: any) {
    console.error("Following fetch error:", error);
    return res.status(500).json({
      message: "Error fetching following",
      error: error.message || "Unknown error",
    });
  }
}
