// src/app/api/gemini/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// .env dosyanızda GEMINI_API_KEY tanımlı olmalı
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
  try {
    const { message: rawMessage } = await request.json();
    // Mesajın varlığını ve tipini kontrol ediyoruz, trim ile temizliyoruz.
    const message = typeof rawMessage === "string" ? rawMessage.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // Gemini 1.5 flash modelini kullanıyoruz
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);

    // API yanıtındaki text bilgisini almak için response.text() çağrılıyor
    const text = await result.response.text();

    return NextResponse.json({ text }, { status: 200 });
  } catch (error: any) {
    console.error("Error generating text:", error);
    return NextResponse.json({ error: "Failed to generate text" }, { status: 500 });
  }
}
