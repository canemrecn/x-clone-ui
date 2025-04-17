import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { sentence } = await req.json();

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Sen bir İngilizce öğretmenisin. Öğrencinin verdiği cümleyi gramer açısından değerlendir. Eğer hata varsa düzelt, nedenini açıkla. Türkçe cevapla.",
      },
      { role: "user", content: sentence },
    ],
  });

  return NextResponse.json({
    result: chatCompletion.choices[0].message.content,
  });
}
