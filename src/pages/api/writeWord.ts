import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { updateUserPoints } from "@/utils/points";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const { content, userId } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Geçerli bir içerik giriniz." });
    }

    if (!userId || typeof userId !== "number") {
      return res.status(400).json({ error: "Geçerli bir kullanıcı ID'si gereklidir." });
    }

    // Gönderideki kelime sayısını hesapla
    const wordCount = content.split(" ").length;

    // Gönderiyi veritabanına kaydet
    const [result] = await db.query(
      "INSERT INTO posts (user_id, content) VALUES (?, ?)",
      [userId, content]
    );

    console.log("📌 Gönderi kaydedildi:", result);

    // Kelime başına 2 puan + gönderi başına 3 puan ekle
    const totalPoints = wordCount * 2 + 3;
    await updateUserPoints(userId, totalPoints);

    return res.status(200).json({ message: "Gönderi başarıyla kaydedildi.", pointsAdded: totalPoints });
  } catch (error) {
    console.error("Hata:", error);
    return res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
}
