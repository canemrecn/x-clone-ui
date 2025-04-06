//src/app/api/dm_messages/create/route.ts
//Bu dosya, kullanıcıların özel mesaj göndermesini sağlayan bir 
//API endpoint’idir (/api/dm_messages/create, POST methodu); 
//gelen istekten mesaj içeriği ve alıcı ID’sini alır, JWT 
//token ile gönderen kullanıcıyı doğrular, mesaj boş değilse 
//dm_messages tablosuna kaydeder ve ardından yeni eklenen 
//mesajı veritabanından çekerek yanıt olarak döner. Eksik 
//bilgi, yetkisiz erişim veya sistem hatalarında uygun hata 
//mesajı ve HTTP durum kodlarıyla cevap verir.
// src/app/api/dm_messages/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, receiverId } = body;

    // Ek: receiverId kontrolü
    if (!receiverId) {
      return NextResponse.json({ error: "Receiver ID is required" }, { status: 400 });
    }

    // Kimlik doğrulama
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Token değeri trim edilerek temizleniyor
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    const decoded = jwt.verify(token, secret) as { id: number };
    const senderId = decoded.id;

    // Mesaj boş mu?
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is empty" }, { status: 400 });
    }

    // DB insert: created_at otomatik atansın
    const insertQuery = `
      INSERT INTO dm_messages (senderId, receiverId, message)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(insertQuery, [senderId, receiverId, message]);

    const insertedId = (result as any).insertId;

    // Yeni mesajı geri çek
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM dm_messages WHERE id = ?",
      [insertedId]
    );
    const newMessage = rows[0];

    return NextResponse.json({ newMessage }, { status: 200 });
  } catch (err: any) {
    console.error("Error in create text message:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
