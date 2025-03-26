import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { updateUserPoints } from "@/utils/points";
import { RowDataPacket } from "mysql2/promise";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const { postId, userId } = req.body;

    if (!postId || !userId) {
      return res.status(400).json({ error: "Geçerli bir gönderi ID'si ve kullanıcı ID gereklidir." });
    }

    // Beğeniyi kaydet
    await db.query("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [postId, userId]);

    // Gönderi sahibine 1 puan ekle
    const [rows]: [RowDataPacket[], any] = await db.query("SELECT user_id FROM posts WHERE id = ?", [postId]);

    if (rows.length > 0) {
      await updateUserPoints(rows[0].user_id, 1);
    }

    return res.status(200).json({ message: "Beğeni başarıyla kaydedildi.", pointsAdded: 1 });
  } catch (error) {
    console.error("Hata:", error);
    return res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
}
