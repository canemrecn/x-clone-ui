// src/app/api/reports/route.ts
/* 
Bu dosya, bir gönderinin şikayet edilmesi durumunda şikayet nedenini ve gönderi bağlantısını belirlenmiş e-posta 
adresine gönderen POST /api/report endpoint’ini tanımlar. Gelen postId ve reason alanları doğrulanıp temizlenir, 
ardından nodemailer kullanılarak şikayet içeriği reportEmail adresine e-posta olarak iletilir. 
E-posta gönderimi için Gmail servis bilgileri ortam değişkenlerinden alınır.
*/
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

    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Token eksik" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET tanımsız");

    const decoded = jwt.verify(token, secret) as { id: number; role: string };
    const userId = decoded.id;

    // Veritabanına kayıt
    await db.query(
      `INSERT INTO reports (post_id, user_id, reason, created_at)
       VALUES (?, ?, ?, NOW())`,
      [postId, userId, reason]
    );

    return NextResponse.json({ message: "Şikayet kaydedildi" }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/reports error:", err);
    return NextResponse.json(
      { error: "Sunucu hatası", message: err.message },
      { status: 500 }
    );
  }
}
