//src/pages/api/likePost.ts
/*Bu dosya, bir gönderiyi beğenme işlemini gerçekleştiren API endpoint’idir ve yalnızca POST isteklerini kabul eder. 
İstekle gelen postId ve userId bilgileriyle, kullanıcı daha önce aynı gönderiyi beğenmişse tekrar eklenmesini 
önlemek için INSERT IGNORE kullanarak likes tablosuna kayıt yapar. Ardından gönderinin sahibini veritabanından 
sorgular ve updateUserPoints fonksiyonuyla sahibine 1 puan ekler. İşlem başarılı olursa 200 yanıtıyla birlikte 
bir onay mesajı ve eklenen puan döner; eksik veri ya da hata durumlarında ise uygun hata mesajlarıyla yanıt verir.*/
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { updateUserPoints } from "@/utils/points";
import { RowDataPacket } from "mysql2/promise";
import { getAuthUser } from "@/utils/getAuthUser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const { postId } = req.body;
    if (!postId) {
      return res
        .status(400)
        .json({ error: "Geçerli bir gönderi ID'si gereklidir." });
    }

    // Get the authenticated user
    const user = await getAuthUser(); // ✅ Hiçbir parametre gönderme

    if (!user) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    // Add like: Prevent duplicate likes using INSERT IGNORE
    await db.query(
      "INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)",
      [postId, user.id]
    );

    // Add 1 point to the post owner
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT user_id FROM posts WHERE id = ?",
      [postId]
    );

    if (rows.length > 0) {
      await updateUserPoints(rows[0].user_id, 1);
    }

    return res.status(200).json({
      message: "Beğeni başarıyla kaydedildi.",
      pointsAdded: 1,
    });
  } catch (error) {
    console.error("Beğeni hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
}
