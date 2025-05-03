// src/pages/api/writeWord.ts
/* Bu dosya, bir kullanıcının yazılı gönderisini (content) veritabanına kaydeden ve içerikteki kelime sayısına göre 
puan kazandıran bir API endpoint’tir. Sadece POST isteği kabul eder; gelen içerik ve kullanıcı ID’si geçerliyse 
gönderiyi posts tablosuna ekler, ardından her kelime için 2 puan ve her gönderi için 3 ek puan olmak üzere toplam 
puanı hesaplayarak updateUserPoints fonksiyonu ile kullanıcının puanını günceller. Başarılı işlem sonrası puan 
bilgisiyle birlikte yanıt döner, hata durumlarında uygun hata mesajı verir. */

import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { updateUserPoints } from "@/utils/points";
import { getAuthUser } from "@/utils/getAuthUser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    // ✅ Parametre olmadan çağrılır
    const user = await getAuthUser(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const { content } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "A valid content is required." });
    }

    // Kelime sayısı hesapla
    const wordCount = content.split(" ").filter(Boolean).length;

    // Gönderiyi veritabanına kaydet
    const [result] = await db.query(
      "INSERT INTO posts (user_id, content) VALUES (?, ?)",
      [user.id, content]
    );

    console.log("📌 Post saved:", result);

    // Toplam puanı hesapla: kelime başına 2 + 3 sabit
    const totalPoints = wordCount * 2 + 3;
    await updateUserPoints(user.id, totalPoints);

    return res.status(200).json({
      message: "Post successfully saved.",
      pointsAdded: totalPoints,
    });
  } catch (error: any) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error occurred." });
  }
}
