import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { updateUserPoints } from "@/utils/points";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const { word, userId } = req.body;

    if (!word || typeof word !== "string") {
      return res.status(400).json({ error: "Geçerli bir kelime giriniz." });
    }

    if (!userId || typeof userId !== "number") {
      return res.status(400).json({ error: "Geçerli bir kullanıcı ID'si gereklidir." });
    }

    // Kelimeyi veritabanına kaydet
    await db.query(
      "INSERT INTO read_words (user_id, word) VALUES (?, ?) ON DUPLICATE KEY UPDATE word = word",
      [userId, word]
    );

    console.log(`📌 Okunan kelime: ${word}`);

    // Kullanıcıya 1 puan ekle
    await updateUserPoints(userId, 1);

    return res.status(200).json({ message: "Kelime okundu.", pointsAdded: 1 });
  } catch (error) {
    console.error("Hata:", error);
    return res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
}
