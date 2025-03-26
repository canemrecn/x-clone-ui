// src/app/api/notes/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket, OkPacket } from "mysql2/promise";

// Yardımcı: Authorization header'dan token alma fonksiyonu
function getTokenFromHeader(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1].trim();
}

// GET: Kullanıcının notlarını çek
export async function GET(request: Request) {
  try {
    // Authorization header'dan token alınıyor
    const token = getTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // JWT doğrulaması
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not defined in .env");
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Kullanıcının notlarını veritabanından çekiyoruz (parametrik sorgu)
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, text, created_at FROM notes WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    return NextResponse.json({ notes: rows }, { status: 200 });
  } catch (error: any) {
    console.error("Notes GET error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}

// POST: Yeni not ekler
export async function POST(request: Request) {
  try {
    // Token'ı Authorization header'dan alıyoruz (POST için de tutarlı olması açısından)
    const token = getTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // JWT doğrulaması
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not defined in .env");
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // İstek gövdesinden not metnini alıyoruz
    const { text } = await request.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ message: "Missing text" }, { status: 400 });
    }
    const trimmedText = text.trim();

    // Notu veritabanına ekliyoruz (parametrik sorgu kullanılarak)
    const [result] = await db.query<OkPacket>(
      "INSERT INTO notes (user_id, text) VALUES (?, ?)",
      [userId, trimmedText]
    );

    return NextResponse.json(
      { message: "Note created", noteId: result.insertId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Notes POST error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
