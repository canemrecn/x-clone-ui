//src/pages/api/readWord.ts
/*Bu dosya, kullanıcıların okudukları kelimeleri veritabanına kaydeden bir POST API endpoint’idir. 
Gelen istekteki word (kelime) ve userId (kullanıcı ID) bilgilerini alır; bu bilgiler geçerliyse, 
kelime read_words tablosuna eklenir (eğer daha önce eklenmişse güncellenmeden geçilir) ve ilgili 
kullanıcıya 1 puan kazandırılır. Başarılı işlem sonucunda 200 OK ile “Kelime okundu” mesajı ve 
eklenen puan sayısı döndürülür; hata durumunda uygun hata mesajı ile yanıt verir.*/
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { updateUserPoints } from "@/utils/points";
import { getAuthUser } from "@/utils/getAuthUser";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const { word } = req.body as { word: string };

    // Kullanıcıyı HttpOnly cookie üzerinden doğrula
    // Get the authenticated user
const user = await getAuthUser(); // <-- sadece bu satırı güncelle

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!word || typeof word !== "string") {
      return res.status(400).json({ error: "Geçerli bir kelime giriniz." });
    }

    // Kelimeyi veritabanına kaydet (varsa güncelleme yapmadan geç)
    await db.query(
      "INSERT INTO read_words (user_id, word) VALUES (?, ?) ON DUPLICATE KEY UPDATE word = word",
      [user.id, word]
    );

    console.log(`📌 Okunan kelime: ${word} (userId: ${user.id})`);

    // Kullanıcıya 1 puan ekle
    await updateUserPoints(user.id, 1);

    return res.status(200).json({
      message: "Kelime okundu.",
      pointsAdded: 1,
    });
  } catch (error: any) {
    console.error("❌ Hata /api/readWord:", error);
    return res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
}
