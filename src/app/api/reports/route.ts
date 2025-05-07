// src/app/api/reports/route.ts
/* 
Bu dosya, bir gönderinin şikayet edilmesi durumunda şikayet nedenini ve gönderi bağlantısını belirlenmiş e-posta 
adresine gönderen POST /api/report endpoint’ini tanımlar. Gelen postId ve reason alanları doğrulanıp temizlenir, 
ardından nodemailer kullanılarak şikayet içeriği reportEmail adresine e-posta olarak iletilir. 
E-posta gönderimi için Gmail servis bilgileri ortam değişkenlerinden alınır.
*/
// src/app/api/reports/route.ts

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { postId, reason } = await req.json();

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
        { error: "postId ve reason boş bırakılamaz." },
        { status: 400 }
      );
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const reportEmail = process.env.REPORT_EMAIL;

    if (!gmailUser || !gmailAppPassword || !reportEmail) {
      console.error("GMAIL_USER, GMAIL_APP_PASSWORD veya REPORT_EMAIL eksik.");
      return NextResponse.json(
        { error: "E-posta ayarları eksik veya hatalı." },
        { status: 500 }
      );
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const postLink = `${baseUrl}/post/${encodeURIComponent(trimmedPostId)}`;

    const mailOptions = {
      from: gmailUser,
      to: reportEmail,
      subject: `Gönderi Şikayeti (Gönderi Linki: ${postLink})`,
      text: `
Merhaba,

Bir kullanıcı aşağıdaki gönderiyi şikayet etti:

Gönderi Linki: ${postLink}

Şikayet Sebebi:
${trimmedReason}

İyi çalışmalar.
      `.trim(),
    };

    // E-posta gönder
    await transporter.sendMail(mailOptions);

    // Veritabanına kaydet
    await db.query(
      "INSERT INTO reports (post_id, reason, created_at) VALUES (?, ?, NOW())",
      [trimmedPostId, trimmedReason]
    );

    return NextResponse.json({ message: "Şikayet başarıyla gönderildi ve kaydedildi." }, { status: 200 });
  } catch (err: any) {
    console.error("Report endpoint error:", err);
    return NextResponse.json(
      { error: err.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}
