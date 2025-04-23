// src/app/api/notes/[noteId]/route.ts
//Bu dosya, belirli bir notu (note) silmeye yarayan bir API endpoint’idir (/api/notes/[noteId], 
 // DELETE methodu); JWT token ile kullanıcının kimliği doğrulanır, ardından silinmek istenen notun 
 // veritabanındaki sahibiyle eşleşip eşleşmediği kontrol edilir. Eğer not mevcutsa ve kullanıcı 
 // notun sahibiyse, notes tablosundan ilgili kayıt güvenli bir şekilde silinir. Aksi takdirde yetkisiz 
 // erişim, bulunamayan not veya sunucu hatalarında uygun hata mesajı ve durum kodları döndürülür.
// src/app/api/notes/[noteId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import type { RowDataPacket, OkPacket } from "mysql2/promise";

export async function DELETE(
  req: NextRequest,
  context: any // ✅ hatayı çözen anahtar nokta
) {
  try {
    const noteId = context.params.noteId;

    const token = req.cookies.get("token")?.value;
    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    } catch (err) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
    }

    const userId = decoded.id;

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT user_id FROM notes WHERE id = ?",
      [noteId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }

    if (rows[0].user_id !== userId) {
      return NextResponse.json({ message: "Not your note" }, { status: 403 });
    }

    await db.query<OkPacket>("DELETE FROM notes WHERE id = ?", [noteId]);

    return NextResponse.json({ message: "Note deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Note DELETE error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
