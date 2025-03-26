// src/app/api/words/read/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    // İstek gövdesinden kelimeyi alıyoruz ve temizliyoruz.
    const { word: rawWord } = await req.json();
    const word = typeof rawWord === "string" ? rawWord.trim() : "";
    if (!word) {
      return NextResponse.json({ message: "No word provided" }, { status: 400 });
    }

    // Authorization header'dan token'ı alıp doğruluyoruz.
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1].trim();

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const user_id = decoded.id;

    // Kullanıcının puanını 0.1 artırıyoruz.
    await db.query("UPDATE users SET points = points + 0.1 WHERE id = ?", [user_id]);

    return NextResponse.json({ message: "Kelime okundu, +0.1 puan" }, { status: 200 });
  } catch (error: any) {
    console.error("Error reading word:", error);
    return NextResponse.json({ message: "Error", error: error.message || "Unknown error" }, { status: 500 });
  }
}
