//src/pages/api/translate.ts
/*Bu dosya, gelen POST isteğiyle belirtilen bir kelimeyi (word), hedef dile (targetLang) çevirmek için Google 
Translate'in resmi olmayan API'sini kullanan bir çeviri endpoint'idir. İstek geçerli ise 
https://translate.googleapis.com üzerinden çeviri sorgusu yapar, gelen yanıtın ilk çeviri 
sonucunu alır ve bunu translation alanı ile birlikte 200 OK olarak döndürür. Geçersiz metod, 
eksik parametre veya API hatalarında uygun hata mesajlarıyla yanıt verir.*/
// src/pages/api/translate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthUser } from '@/utils/getAuthUser';
import { db } from '@/lib/db';

interface TranslateRequest {
  word: string;
  targetLang: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST isteklerine izin verilir' });
  }

  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Giriş yapılmadan çeviri yapılamaz' });
    }

    const body = req.body as TranslateRequest;
    const { word, targetLang } = body;

    if (!word || typeof word !== 'string') {
      return res.status(400).json({ error: 'Kelime belirtilmelidir' });
    }
    if (!targetLang || typeof targetLang !== 'string') {
      return res.status(400).json({ error: 'Hedef dil belirtilmelidir' });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(word)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Translation API request failed');

    const data = await response.json();
    const translatedText = data?.[0]?.[0]?.[0] || 'Çeviri bulunamadı';

    await db.query(
      'INSERT INTO translated_words (user_id, word, translated_to) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE translated_to = VALUES(translated_to)',
      [user.id, word, targetLang]
    );

    return res.status(200).json({ translation: translatedText, pointsAdded: 1 });
  } catch (error) {
    console.error('❌ Translate API Error:', error);
    return res.status(500).json({ error: 'Çeviri sırasında sunucu hatası oluştu' });
  }
}
