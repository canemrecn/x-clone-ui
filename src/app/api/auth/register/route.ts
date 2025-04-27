// src/app/api/auth/register/route.ts
/*
Bu dosya, yeni kullanıcı kaydını sağlar (POST /api/auth/register).
Gelen bilgiler doğrulanır, şifreler hash'lenir, kullanıcı veritabanına eklenir.
Başarıyla kaydedilen kullanıcıya 4 haneli doğrulama kodu e-posta ile gönderilir.
*/

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import nodemailer from "nodemailer";

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let {
      full_name,
      username,
      email,
      password,
      securityQuestion,
      securityAnswer,
      promoConsent,
      transferConsent,
      analyticsConsent,
    } = body;

    full_name = full_name?.trim();
    username = username?.trim();
    email = email?.trim();
    securityQuestion = securityQuestion?.trim();
    securityAnswer = securityAnswer?.trim();

    if (!full_name || !username || !email || !password || !securityQuestion || !securityAnswer) {
      return NextResponse.json({ message: "Tüm alanlar zorunludur." }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Geçersiz e-posta formatı." }, { status: 400 });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ message: `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.` }, { status: 400 });
    }

    const [existingUsers] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username]
    );
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "Bu e-posta veya kullanıcı adı zaten kullanılıyor." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer, SALT_ROUNDS);
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4 haneli doğrulama kodu

    await db.query(
      `INSERT INTO users (
        full_name, username, email, password,
        verification_code, security_question, security_answer,
        is_verified, joined_date,
        accept_email, accept_transfer, accept_analytics
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?)`,
      [
        full_name,
        username,
        email,
        hashedPassword,
        verificationCode,
        securityQuestion,
        hashedSecurityAnswer,
        false,
        promoConsent ? 1 : 0,
        transferConsent ? 1 : 0,
        analyticsConsent ? 1 : 0,
      ]
    );

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    if (!gmailUser || !gmailAppPassword) {
      return NextResponse.json({ message: "E-posta ayarları eksik." }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailAppPassword },
    });

    const mailOptions = {
      from: gmailUser,
      to: email,
      subject: "Undergo Hesap Doğrulama",
      text: `Merhaba ${full_name},\n\nUndergo hesabınızı doğrulamak için kodunuz: ${verificationCode}\n\nBu kodu kimseyle paylaşmayın.\n\nTeşekkürler,\nUndergo Ekibi`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("📨 Kayıt sonrası e-posta başarıyla gönderildi.");
    } catch (emailError: any) {
      console.error("❌ Doğrulama e-postası gönderilemedi:", emailError);
      return NextResponse.json({ message: "Doğrulama e-postası gönderilemedi.", error: String(emailError) }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Kayıt başarılı. Lütfen e-posta adresinizi kontrol edin." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("🚨 Register Error:", error);
    return NextResponse.json({ message: "Sunucu hatası", error: String(error) }, { status: 500 });
  }
}
