//src/app/api/notes/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket, OkPacket } from "mysql2/promise";

export async function GET(request: Request) {
  try {
    // Auth header kontrol
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    // JWT kontrol
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not defined in .env");
    }
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // DB'den kullanıcının notlarını çek
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, text, created_at FROM notes WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    return NextResponse.json({ notes: rows }, { status: 200 });
  } catch (error) {
    console.error("Notes GET error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { token, text } = await request.json();

    if (!token || !text) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not defined in .env");
    }
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // DB'ye not ekle
    const [result] = await db.query<OkPacket>(
      "INSERT INTO notes (user_id, text) VALUES (?, ?)",
      [userId, text]
    );

    return NextResponse.json(
      { message: "Note created", noteId: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Notes POST error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
