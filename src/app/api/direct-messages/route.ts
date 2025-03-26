import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Örnek DB bağlantısı (mysql2/promise)
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Parametreleri trim edip temizliyoruz
    const buddyIdRaw = searchParams.get("buddyId");
    const tokenRaw = searchParams.get("token");

    if (!buddyIdRaw || !tokenRaw) {
      return NextResponse.json(
        { message: "buddyId and token are required" },
        { status: 400 }
      );
    }
    const buddyId = buddyIdRaw.trim();
    const token = tokenRaw.trim();

    // Token'dan user_id çek (örnek)
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const currentUserId = decoded.id;

    // İki kullanıcı arasındaki mesajları getir (opsiyonel: buddyId'nin numeric olup olmadığını kontrol edebilirsiniz)
    const [rows] = await db.query(
      `
      SELECT * FROM messages
      WHERE
        (sender_id = ? AND receiver_id = ?)
        OR
        (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
      `,
      [currentUserId, buddyId, buddyId, currentUserId]
    );

    return NextResponse.json({ messages: rows }, { status: 200 });
  } catch (error) {
    console.error("DM GET error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Verileri trim ederek temizliyoruz
    const tokenRaw = body.token;
    const buddyIdRaw = body.buddyId;
    const textRaw = body.text;
    
    if (!tokenRaw || !buddyIdRaw || !textRaw) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }
    const token = tokenRaw.toString().trim();
    const buddyId = buddyIdRaw.toString().trim();
    // text içeriğinin de trim edilmesi (opsiyonel: minimum uzunluk kontrolü eklenebilir)
    const text = textRaw.toString().trim();

    // Token'dan user_id çek
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const currentUserId = decoded.id;

    // Mesajı veritabanına ekle (parametrik sorgu)
    await db.query(
      `INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)`,
      [currentUserId, buddyId, text]
    );

    return NextResponse.json({ message: "Message sent successfully" }, { status: 201 });
  } catch (error) {
    console.error("DM POST error:", error);
    return NextResponse.json({ message: "Database error", error: String(error) }, { status: 500 });
  }
}
