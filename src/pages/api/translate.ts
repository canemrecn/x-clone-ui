import type { NextApiRequest, NextApiResponse } from "next";

interface TranslateRequest {
  word: string;
  targetLang: string;
}

/**
 * POST /api/translate
 * body: { word, targetLang }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const { word, targetLang } = req.body as TranslateRequest;

    if (!word) {
      return res.status(400).json({ error: "Kelime belirtilmelidir" });
    }
    if (!targetLang) {
      return res.status(400).json({ error: "Hedef dil belirtilmelidir" });
    }

    // Instead of sl=en, we use sl=auto => Google will detect the source language
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      word
    )}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Translation API request failed");
    }
    const data = await response.json();

    // Google’s array structure: data[0][0][0] => translated text
    const translatedText = data?.[0]?.[0]?.[0] || "Çeviri bulunamadı";

    return res.status(200).json({ translation: translatedText });
  } catch (error: any) {
    console.error("Çeviri API Hatası:", error);
    return res.status(500).json({ error: "Çeviri sırasında hata oluştu" });
  }
}
