// src/app/api/dm_messages/route.ts
//Bu dosya, iki kullanıcı arasındaki özel mesajları (DM) getiren bir API endpoint’idir 
//(/api/dm_messages, GET methodu); URL üzerinden gelen buddyId parametresiyle birlikte 
//JWT token aracılığıyla kimliği doğrulanan kullanıcının ID’si alınır, ardından areUsersBlocked 
//fonksiyonu ile kullanıcılar arasında engel (blok) olup olmadığı kontrol edilir. Eğer 
//blok yoksa, bu iki kullanıcı arasında gönderilmiş tüm mesajlar dm_messages tablosundan 
//çekilir ve kronolojik sırayla döndürülür; blok varsa mesajlara erişim engellenir. 
//Hatalı parametre, yetkisiz erişim veya sistem hatalarında uygun hata mesajı ile yanıt verir.
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { areUsersBlocked } from "@/utils/blockHelpers";
import { getAuthUser } from "@/utils/getAuthUser";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET method allowed" });
  }

  try {
    const buddyIdParam = req.query.buddyId;
    if (!buddyIdParam || Array.isArray(buddyIdParam)) {
      return res.status(400).json({ message: "buddyId param is required" });
    }

    const buddyId = Number(buddyIdParam.trim());
    if (!buddyId) {
      return res.status(400).json({ message: "Invalid buddyId" });
    }

    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = user.id;

    const blocked = await areUsersBlocked(userId, buddyId);
    if (blocked) {
      return res.status(403).json({
        message: "Mesajlaşma işlemi gerçekleştirilemez. Kullanıcı ile aranızda blok var.",
      });
    }

    const query = `
      SELECT * 
      FROM dm_messages
      WHERE 
        (senderId = ? AND receiverId = ?)
        OR (senderId = ? AND receiverId = ?)
      ORDER BY created_at ASC
    `;
    const [rows] = await db.query<RowDataPacket[]>(query, [userId, buddyId, buddyId, userId]);

    return res.status(200).json({ messages: rows });
  } catch (error: any) {
    console.error("Error fetching DM messages:", error);
    return res.status(500).json({ message: error.message || "Error fetching messages" });
  }
}
