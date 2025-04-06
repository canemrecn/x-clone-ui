//src/app/api/direct-messages/route.ts
//Bu dosya, kullanıcılar arası doğrudan mesajlaşmayı yöneten 
//bir API endpoint’idir (/api/direct-messages) ve iki HTTP 
//metodunu destekler: GET isteğiyle JWT token üzerinden 
//kimliği doğrulanan kullanıcının belirli bir kişiyle 
//(buddyId) olan tüm mesaj geçmişini veritabanından alır 
//ve kronolojik sırayla döner; POST isteğiyle yine token 
//ile doğrulanan kullanıcıdan gelen mesaj metni ve alıcı 
//ID’si alınarak yeni mesaj veritabanına kaydedilir. 
//Her iki işlemde de JWT doğrulama zorunludur, eksik 
//veya hatalı bilgilerde uygun yanıtlar, hata durumlarında 
//ise 500 hata kodu döner.
// src/app/api/direct-messages/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

/**
 * GET: İki kullanıcı arasındaki mesaj geçmişini getir
 * POST: Yeni mesaj gönder
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
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

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const currentUserId = decoded.id;

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
    const text = textRaw.toString().trim();

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const currentUserId = decoded.id;

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
