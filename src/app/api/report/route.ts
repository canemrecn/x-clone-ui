// src/app/api/report/route.ts
/* 
Bu dosya, bir gönderinin şikayet edilmesi durumunda şikayet nedenini ve gönderi bağlantısını belirlenmiş e-posta 
adresine gönderen POST /api/report endpoint’ini tanımlar. Gelen postId ve reason alanları doğrulanıp temizlenir, 
ardından nodemailer kullanılarak şikayet içeriği reportEmail adresine e-posta olarak iletilir. 
E-posta gönderimi için Gmail servis bilgileri ortam değişkenlerinden alınır.
*/

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Transporter'ı modül düzeyinde tanımlayarak her istek için yeniden oluşturulmasını engelliyoruz.
// Bu, performansı artırır ve kaynak tüketimini azaltır.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  pool: true, // çoklu bağlantı havuzu performansı için
});

export async function POST(req: NextRequest) {
  try {
    const { postId, reason } = await req.json();

    // Gelen değerlerin kontrolü
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

    // Ortam değişkenlerinden e-posta ayarlarını al
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const reportEmail = process.env.REPORT_EMAIL;

    if (!gmailUser || !gmailAppPassword || !reportEmail) {
      console.error("GMAIL_USER, GMAIL_APP_PASSWORD veya REPORT_EMAIL tanımlı değil.");
      return NextResponse.json(
        { error: "E-posta ayarları eksik veya hatalı." },
        { status: 500 }
      );
    }

    // BASE_URL'i ortam değişkeninden al, yoksa localhost kullan
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const postLink = `${baseUrl}/post/${encodeURIComponent(trimmedPostId)}`;

    // E-posta içeriği
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

    // E-posta gönderimi
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Şikayet e-postası başarıyla gönderildi." }, { status: 200 });
  } catch (err: any) {
    console.error("Report endpoint error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
