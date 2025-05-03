// src/app/api/follows/route.ts
//Bu dosya, kullanıcıların başka kullanıcıları takip etme veya takibi bırakma işlemlerini gerçekleştiren 
//bir API endpoint’idir (/api/follows, POST methodu); JWT token ile kimliği doğrulanan kullanıcının 
//isteği doğrultusunda action değeri "follow" ise daha önce takip etmediyse follows tablosuna kayıt 
//ekler ve aynı zamanda bir takip bildirimi oluşturur, "unfollow" ise ilgili takip kaydını siler. 
//Ayrıca, kullanıcılar arasında engelleme (blok) varsa işlem engellenir. Eksik veya hatalı veri, 
//geçersiz işlem veya yetkisiz erişim durumlarında uygun mesaj ve durum kodlarıyla yanıt verir.
// src/app/api/follows/route.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { getAuthUser } from "@/utils/getAuthUser";
import { areUsersBlocked } from "@/utils/blockHelpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST method allowed" });
  }

  try {
    const { following_id, action } = req.body;

    if (!following_id || !action) {
      return res.status(400).json({ message: "Eksik veri" });
    }

    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const follower_id = user.id;

    // Blok kontrolü
    const blocked = await areUsersBlocked(follower_id, following_id);
    if (blocked) {
      return res.status(403).json({ message: "Takip işlemi yapılamaz, kullanıcı engellenmiş." });
    }

    if (action === "follow") {
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1",
        [follower_id, following_id]
      );
      if (rows.length > 0) {
        return res.status(200).json({ message: "Zaten takip ediliyor" });
      }

      await db.query(
        "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)",
        [follower_id, following_id]
      );

      await db.query(
        "INSERT INTO notifications (user_id, type, from_user_id, post_id) VALUES (?, 'follow', ?, NULL)",
        [following_id, follower_id]
      );

      return res.status(200).json({ message: "Takip edildi" });
    }

    if (action === "unfollow") {
      await db.query(
        "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
        [follower_id, following_id]
      );

      return res.status(200).json({ message: "Takipten çıkıldı" });
    }

    return res.status(400).json({ message: "Geçersiz işlem" });
  } catch (error: any) {
    console.error("Takip sistemi hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası", error: error.message || "" });
  }
}
