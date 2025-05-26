// src/app/api/reports/route.ts
// src/app/api/reports/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, reason } = body;

    if (!postId || !reason) {
      return NextResponse.json(
        { error: "postId ve reason alanları zorunludur." },
        { status: 400 }
      );
    }

    const trimmedPostId = postId.toString().trim();
    const trimmedReason = reason.toString().trim();

    if (!trimmedPostId || !trimmedReason) {
      return NextResponse.json(
        { error: "Boş değer gönderilemez." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Kimlik doğrulaması gerekli." }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET tanımlı değil");
    }

    const decoded = jwt.verify(token, secret) as { id: number; role: string };
    const userId = decoded.id;

    // Veritabanına kayıt işlemi
    await db.query(
      `INSERT INTO reports (post_id, user_id, reason, created_at)
       VALUES (?, ?, ?, NOW())`,
      [trimmedPostId, userId, trimmedReason]
    );

    return NextResponse.json({ message: "Şikayet başarıyla kaydedildi." }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/reports error:", err);
    return NextResponse.json(
      { error: "Sunucu hatası", message: err.message },
      { status: 500 }
    );
  }
}
