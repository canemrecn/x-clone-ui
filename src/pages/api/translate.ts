// src/pages/api/translate.ts (Eğer App Router değilse)
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const { word, targetLang } = req.body;

    if (!word) {
      return res.status(400).json({ error: "Kelime belirtilmelidir" });
    }
    if (!targetLang) {
      return res.status(400).json({ error: "Hedef dil belirtilmelidir" });
    }

    // Google Translate API
    // sl=en -> İngilizce kaynak (isterseniz postData.lang da sourceLang yapabilirsiniz)
    // tl=targetLang -> Seçilen dil
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(word)}`;

    const response = await fetch(url);
    const data = await response.json();

    const translatedText = data[0][0][0] || "Çeviri bulunamadı";
    return res.status(200).json({ translation: translatedText });
  } catch (error) {
    console.error("Çeviri API Hatası:", error);
    return res.status(500).json({ error: "Çeviri sırasında hata oluştu" });
  }
}

