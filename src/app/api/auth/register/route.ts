// src/app/api/auth/register/route.ts
//Bu dosya, yeni kullanıcı kaydı işlemini gerçekleştiren bir API endpoint’idir 
//(/api/auth/register); kullanıcıdan ad, kullanıcı adı, e-posta, şifre, 
//güvenlik sorusu ve cevabı alır, geçerlilik kontrollerini yapar, eğer 
//e-posta veya kullanıcı adı sistemde yoksa şifre ve güvenlik cevabını 
//hash’leyerek kullanıcıyı is_verified false olacak şekilde veritabanına 
//kaydeder. Ardından rastgele oluşturulan 4 haneli doğrulama kodunu 
//kullanıcıya e-posta ile gönderir. E-posta gönderimi için Gmail ve 
//Nodemailer kullanılır. Hatalarda anlamlı geri bildirimler verir, 
//başarılı durumda kullanıcıdan e-postasını kontrol etmesi istenir.
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import nodemailer from "nodemailer";

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
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
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` }, { status: 400 });
    }

    const [existingUsers] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username]
    );
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "Email or Username already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer, SALT_ROUNDS);
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

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
        Boolean(promoConsent ?? false),
        Boolean(transferConsent ?? false),
        Boolean(analyticsConsent ?? false),
      ]
    );

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    if (!gmailUser || !gmailAppPassword) {
      return NextResponse.json({ message: "E-posta ayarları eksik" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailAppPassword },
      logger: true,
      debug: true,
    });

    const mailOptions = {
      from: gmailUser,
      to: email,
      subject: "Undergo Hesap Doğrulama",
      text: `Merhaba ${full_name},\n\nUndergo hesabınızı doğrulamak için kodunuz: ${verificationCode}\n\nBu kodu kimseyle paylaşmayın.\n\nTeşekkürler, Undergo Ekibi`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email send error:", emailError);
    }

    return NextResponse.json({ message: "User registered successfully. Lütfen e-postanızı kontrol edin." }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Database error", error: String(error) }, { status: 500 });
  }
}
