// src/app/api/notes/route.ts
//Bu dosya, kullanıcının notlarını yönetmesini sağlayan bir API endpoint’idir (/api/notes) ve iki işlemi 
//destekler: GET methodu ile JWT token doğrulaması sonrası kullanıcının veritabanındaki notlarını tarihe 
//göre sıralı şekilde getirir; POST methodu ile yine token doğrulaması yaparak, gelen text verisini kontrol 
//eder ve temizleyerek notes tablosuna yeni bir not olarak ekler. Yetkisiz erişim, eksik veri veya sunucu 
//hatalarında uygun hata mesajı ve durum kodları döndürülür.
// src/app/api/notes/route.ts

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { RowDataPacket, OkPacket } from "mysql2/promise";

// Cookie'den token çekme
async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return token || null;
}

// GET: Kullanıcının notlarını getir
export async function GET() {
  try {
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

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

// POST: Yeni not ekle
export async function POST(request: Request) {
  try {
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    const { text } = await request.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ message: "Missing text" }, { status: 400 });
    }

    const trimmedText = text.trim();

    const [result] = await db.query<OkPacket>(
      "INSERT INTO notes (user_id, text) VALUES (?, ?)",
      [userId, trimmedText]
    );

    // Yeni notun detaylarını al
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, text, created_at FROM notes WHERE id = ?",
      [result.insertId]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "Note created, but note retrieval failed" },
        { status: 500 }
      );
    }
    const newNote = rows[0];

    return NextResponse.json({ message: "Note created", note: newNote }, { status: 201 });
  } catch (error: any) {
    console.error("Notes POST error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
