// src/app/api/notes/[noteId]/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket, OkPacket } from "mysql2/promise";

interface Context {
  params: { noteId: string };
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const { noteId } = params;
    const { token: rawToken } = await request.json();

    // Token kontrolü ve temizleme
    if (!rawToken) {
      return NextResponse.json({ message: "No token provided" }, { status: 400 });
    }
    const token = rawToken.toString().trim();

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not defined in .env");
    }

    // JWT token doğrulaması ve kullanıcı ID'sinin alınması
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Notun sahibi kontrol ediliyor.
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT user_id FROM notes WHERE id = ?",
      [noteId]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }
    // Güvenlik: Not sahibi, token'dan alınan userId ile eşleşmeli
    if (rows[0].user_id !== userId) {
      return NextResponse.json({ message: "Not your note" }, { status: 403 });
    }

    // Notu veritabanından silme işlemi (parametrik sorgu ile)
    await db.query<OkPacket>("DELETE FROM notes WHERE id = ?", [noteId]);

    return NextResponse.json({ message: "Note deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("Note DELETE error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
