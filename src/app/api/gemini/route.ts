// src/app/api/gemini/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// .env dosyanızda GEMINI_API_KEY tanımlı olmalı
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  const { message } = await request.json();
  if (!message) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }

  try {
    // Gemini 1.5 flash modelini kullanıyoruz
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error generating text:", error);
    return NextResponse.json({ error: "Failed to generate text" }, { status: 500 });
  }
}
