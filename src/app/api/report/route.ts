// src/app/api/report/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Transporter'ı modül düzeyinde tanımlayarak her istek için yeniden oluşturulmasını engelliyoruz.
// Bu, performansı artırır.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  // İsteğe bağlı: Çok sayıda e-posta gönderimi için pool kullanımı performansı artırır.
  pool: true,
});

export async function POST(req: NextRequest) {
  try {
    const { postId, reason } = await req.json();

    // Giriş alanları temizlenip, doğrulanıyor.
    if (!postId || !reason) {
      return NextResponse.json(
        { error: "postId ve reason gereklidir" },
        { status: 400 }
      );
    }
    const trimmedPostId = postId.toString().trim();
    const trimmedReason = reason.toString().trim();
    if (!trimmedPostId || !trimmedReason) {
      return NextResponse.json(
        { error: "postId ve reason boş olamaz" },
        { status: 400 }
      );
    }

    // Ortam değişkenlerinden e-posta ayarlarını alıyoruz.
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const reportEmail = process.env.REPORT_EMAIL;

    if (!gmailUser || !gmailAppPassword || !reportEmail) {
      return NextResponse.json(
        { error: "E-posta ayarları eksik" },
        { status: 500 }
      );
    }

    // Temel URL'i ortam değişkeninden alıyoruz, yoksa varsayılan olarak localhost kullanıyoruz.
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const postLink = `${baseUrl}/post/${trimmedPostId}`;

    // E-posta içeriği oluşturuluyor.
    const mailOptions = {
      from: gmailUser,
      to: reportEmail,
      subject: `Gönderi Şikayeti (Link: ${postLink})`,
      text: `
Merhaba,

Bir kullanıcı aşağıdaki gönderiyi şikayet etti:

Gönderi Linki: ${postLink}

Şikayet Metni:
${trimmedReason}

İyi çalışmalar.
      `,
    };

    // E-posta gönderimi yapılır.
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Report email sent" }, { status: 200 });
  } catch (err: any) {
    console.error("Report endpoint error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
