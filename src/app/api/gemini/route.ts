// src/app/api/gemini/route.ts
//Bu dosya, Google Gemini API'yi kullanarak kullanıcıdan gelen metne göre yapay zeka tarafından 
//içerik üreten bir API endpoint’idir (/api/gemini, POST methodu); gelen istekteki message verisini 
//alır, varsa gemini-1.5-flash modelini kullanarak bu metne karşılık bir yanıt oluşturur ve dönen 
//sonucu istemciye JSON formatında iletir. Eksik mesaj veya sistemsel hatalarda uygun hata mesajlarıyla 
//yanıt verir.
// src/app/api/gemini/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import jwt from "jsonwebtoken";

// .env dosyanızda GEMINI_API_KEY tanımlı olmalı
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
  try {
    // Authorization header'dan token'ı al
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Token'ı trim ederek temizliyoruz
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    // Token'ı doğruluyoruz
    let decoded;
    try {
      decoded = jwt.verify(token, secret) as { id: number };
    } catch (err) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
    }

    const { message: rawMessage } = await request.json();
    const message = typeof rawMessage === "string" ? rawMessage.trim() : "";

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // Gemini 1.5 flash modelini kullanarak yanıt al
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);

    const text = await result.response.text();

    return NextResponse.json({ text }, { status: 200 });
  } catch (error: any) {
    console.error("Error generating text:", error);
    return NextResponse.json({ error: "Failed to generate text" }, { status: 500 });
  }
}
