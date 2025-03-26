import { NextApiRequest, NextApiResponse } from "next";
import { updateUserPoints } from "@/utils/points";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const { userId, points } = req.body;

    if (!userId || points === undefined) {
      return res.status(400).json({ error: "userId ve points gereklidir" });
    }

    // Kullanıcının puanını güncelle
    await updateUserPoints(userId, points);

    return res.status(200).json({ message: "Puan başarıyla güncellendi." });
  } catch (error) {
    console.error("Hata:", error as any);
    return res.status(500).json({ error: "Puan güncellenirken hata oluştu" });
  }
}
