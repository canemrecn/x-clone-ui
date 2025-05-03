//src/pages/api/translate.ts
/*Bu dosya, gelen POST isteğiyle belirtilen bir kelimeyi (word), hedef dile (targetLang) çevirmek için Google 
Translate'in resmi olmayan API'sini kullanan bir çeviri endpoint'idir. İstek geçerli ise 
https://translate.googleapis.com üzerinden çeviri sorgusu yapar, gelen yanıtın ilk çeviri 
sonucunu alır ve bunu translation alanı ile birlikte 200 OK olarak döndürür. Geçersiz metod, 
eksik parametre veya API hatalarında uygun hata mesajlarıyla yanıt verir.*/
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/utils/getAuthUser";
import { db } from "@/lib/db";

interface TranslateRequest {
  word: string;
  targetLang: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş yapılmadan çeviri yapılamaz" }, { status: 401 });
    }

    const body = await request.json() as TranslateRequest;
    const { word, targetLang } = body;

    if (!word || typeof word !== "string") {
      return NextResponse.json({ error: "Kelime belirtilmelidir" }, { status: 400 });
    }
    if (!targetLang || typeof targetLang !== "string") {
      return NextResponse.json({ error: "Hedef dil belirtilmelidir" }, { status: 400 });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(word)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Translation API request failed");

    const data = await response.json();
    const translatedText = data?.[0]?.[0]?.[0] || "Çeviri bulunamadı";

    await db.query(
      "INSERT INTO translated_words (user_id, word, translated_to) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE translated_to = VALUES(translated_to)",
      [user.id, word, targetLang]
    );

    return NextResponse.json({ translation: translatedText, pointsAdded: 1 }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Translate API Error:", error);
    return NextResponse.json({ error: "Çeviri sırasında sunucu hatası oluştu" }, { status: 500 });
  }
}
