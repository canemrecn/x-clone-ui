//src/pages/api/commentPost.ts
/*Bu dosya, bir gönderiye yorum yapıldığında çalıştırılan bir API endpoint’idir ve yalnızca POST isteğini kabul eder. 
postId ve userId verileriyle birlikte gelen isteklerde, ilgili gönderinin sahibini veritabanından sorgular ve 
updateUserPoints fonksiyonunu kullanarak gönderi sahibine 1 puan ekler. Bu işlem başarıyla tamamlanırsa, 200 
durum kodu ile başarı mesajı ve eklenen puanı döner; eksik veri ya da sunucu hatalarında ise uygun hata 
mesajlarıyla yanıt verir.*/
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { updateUserPoints } from "@/utils/points";
import { RowDataPacket } from "mysql2/promise";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const { postId, userId } = req.body;

    if (!postId || !userId) {
      return res
        .status(400)
        .json({ error: "Geçerli bir gönderi ID'si ve kullanıcı ID gereklidir." });
    }

    // Yorum yapıldığında gönderi sahibine 1 puan ekle
    const [rows] = await db.query<RowDataPacket[]>( 
      "SELECT user_id FROM posts WHERE id = ?",
      [postId]
    );

    if (rows.length > 0) {
      await updateUserPoints(rows[0].user_id, 1);
    }

    return res.status(200).json({
      message: "Yorum başarıyla kaydedildi.",
      pointsAdded: 1,
    });
  } catch (error) {
    console.error("Hata:", error);
    return res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
}
