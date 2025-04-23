//src/pages/api/updatePoints.ts
/*Bu dosya, gelen POST isteği ile belirtilen bir kullanıcının (userId) puanını (points) güncelleyen bir API endpoint'idir. 
updateUserPoints fonksiyonunu kullanarak veritabanında puan güncellemesi yapar. userId veya points eksikse 400, 
başarılıysa 200, bir hata oluşursa 500 koduyla uygun JSON yanıtı döner.*/
// src/pages/api/updatePoints.ts
/* Bu dosya, gelen POST isteği ile belirtilen bir kullanıcının (userId) puanını (points) güncelleyen bir API endpoint'idir. 
updateUserPoints fonksiyonunu kullanarak veritabanında puan güncellemesi yapar. userId veya points eksikse 400, 
başarılıysa 200, bir hata oluşursa 500 koduyla uygun JSON yanıtı döner. */

import type { NextApiRequest, NextApiResponse } from "next";
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
    // ✅ Güncel kullanım: Parametre yok
    const authUser = await getAuthUser();
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized. Lütfen giriş yapınız." });
    }

    const { points } = req.body as { points: number };

    if (points === undefined) {
      return res.status(400).json({ error: "Puan bilgisi gereklidir." });
    }

    await updateUserPoints(authUser.id, points);

    return res.status(200).json({ message: "Puan başarıyla güncellendi." });
  } catch (error: any) {
    console.error("Puan güncelleme hatası:", error);
    return res.status(500).json({ error: "Puan güncellenirken sunucu hatası oluştu." });
  }
}
