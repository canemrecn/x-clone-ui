// src/app/api/dm_messages/send/route.ts
/*
Bu dosya, bir kullanıcının başka bir kullanıcıya belirli bir gönderiye (postId) ait bağlantıyı
özel mesaj olarak göndermesini sağlayan /api/dm_messages/send endpoint’idir.
JWT ile kullanıcı kimliği doğrulanır, alıcı ID’si ve gönderi ID’si alınır,
bağlantı oluşturulur ve dm_messages tablosuna kaydedilir.
Başarıda 200, hatalarda uygun hata kodları döner.
*/
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { getAuthUser } from "@/utils/getAuthUser";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const senderId = user.id;

    const { toUserId, postId } = req.body;

    if (!toUserId || !postId) {
      return res.status(400).json({ error: "toUserId ve postId alanları zorunludur." });
    }

    const receiverId = Number(toUserId);
    if (isNaN(receiverId)) {
      return res.status(400).json({ error: "Geçersiz alıcı kullanıcı ID'si." });
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const messageLink = `${baseUrl}/post/${postId}`;

    await db.query(
      `INSERT INTO dm_messages (senderId, receiverId, message) VALUES (?, ?, ?)`,
      [senderId, receiverId, messageLink]
    );

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "localhost";
    const userAgent = req.headers["user-agent"] || "unknown";

    await db.query(
      `INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [
        senderId,
        "message_sent",
        `DM to user ${receiverId}: ${messageLink}`,
        ip,
        userAgent,
      ]
    );

    return res.status(200).json({ message: "Mesaj başarıyla gönderildi." });
  } catch (error: any) {
    console.error("🚨 Send DM Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
