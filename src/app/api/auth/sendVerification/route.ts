//src/app/api/auth/sendVerification/route.ts
//Bu dosya, belirli bir e-posta adresine ve verilen doğrulama koduna sahip 
//kullanıcıya doğrulama e-postası gönderen bir API endpoint’idir 
//(/api/auth/sendVerification); gelen istekten e-posta ve doğrulama kodunu 
//alır, geçerlilik kontrollerini yaptıktan sonra Gmail SMTP ayarlarıyla 
//Nodemailer üzerinden doğrulama kodunu içeren bir e-posta gönderir. Ortam 
//değişkenleri eksikse veya hata oluşursa uygun hata mesajı döner, başarı 
//durumunda "Verification email sent" yanıtı verir.
// src/app/api/auth/sendVerification/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Basit email regex (temel düzeyde kontrol)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // İstek gövdesinden email ve verificationCode bilgilerini alıyoruz
    const { email: rawEmail, verificationCode: rawVerificationCode } = await req.json();

    // Giriş verilerini trim ederek temizliyoruz
    const email = rawEmail?.toString().trim();
    const verificationCode = rawVerificationCode?.toString().trim();

    if (!email || !verificationCode) {
      return NextResponse.json(
        { error: "Email ve verificationCode gereklidir" },
        { status: 400 }
      );
    }

    // Email formatı kontrolü
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir email adresi giriniz" },
        { status: 400 }
      );
    }

    // Ortam değişkenlerinden Gmail ayarlarını çekiyoruz
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      return NextResponse.json(
        { error: "E-posta ayarları eksik" },
        { status: 500 }
      );
    }

    // Nodemailer transporter'ı oluşturuyoruz (Gmail kullanarak)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    // E-posta içeriği: Doğrulama kodunu kullanıcıya gönderiyoruz.
    const mailOptions = {
      from: gmailUser,
      to: email,
      subject: "Hesap Doğrulama Kodu",
      text: `Merhaba,

Hesabınızı doğrulamak için lütfen aşağıdaki doğrulama kodunu kullanın:

${verificationCode}

İyi çalışmalar.
      `,
    };

    // E-postayı gönderiyoruz
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Verification email sent" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Verification endpoint error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
