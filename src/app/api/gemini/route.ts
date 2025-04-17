// src/app/api/gemini/route.ts
//Bu dosya, Google Gemini API'yi kullanarak kullanıcıdan gelen metne göre yapay zeka tarafından 
//içerik üreten bir API endpoint’idir (/api/gemini, POST methodu); gelen istekteki message verisini 
//alır, varsa gemini-1.5-flash modelini kullanarak bu metne karşılık bir yanıt oluşturur ve dönen 
//sonucu istemciye JSON formatında iletir. Eksik mesaj veya sistemsel hatalarda uygun hata mesajlarıyla 
//yanıt verir.
// src/app/api/gemini/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserFromCookies } from "@/lib/auth"; // Kullanıcıyı cookie'den al

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
  const user = await getUserFromCookies(); // kullanıcı giriş yapmış mı kontrolü
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { message } = await request.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    const text = await result.response.text();

    return NextResponse.json({ text }, { status: 200 });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ error: "Failed to generate text" }, { status: 500 });
  }
}
