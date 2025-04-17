// src/app/api/daily-words/route.ts
// 📁 src/app/api/daily-words/route.ts
import { NextRequest, NextResponse } from "next/server";
import customEnglishWords from "@/data/customEnglishWords.json";
import levenshtein from "js-levenshtein";

export async function POST(req: NextRequest) {
  const { words } = await req.json(); // 🔁 artık tek kelime değil, kelime dizisi alıyoruz

  if (!Array.isArray(words)) {
    return NextResponse.json({ error: "Geçersiz veri formatı." }, { status: 400 });
  }

  const results = words.map((word: string) => {
    const isCorrect = customEnglishWords.includes(word.toLowerCase());

    if (isCorrect) {
      return { word, isCorrect: true };
    }

    let closest = word;
    let minDistance = Infinity;

    for (const w of customEnglishWords) {
      const distance = levenshtein(word.toLowerCase(), w.toLowerCase());
      if (distance < minDistance) {
        minDistance = distance;
        closest = w;
      }
    }

    return {
      word,
      isCorrect: false,
      suggestion: closest,
    };
  });

  return NextResponse.json({ results });
}
