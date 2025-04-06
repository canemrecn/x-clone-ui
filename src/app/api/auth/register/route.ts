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
// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import nodemailer from "nodemailer";

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

// Basit email regex kontrolü (temel düzeyde)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { full_name, username, email, password, securityQuestion, securityAnswer } = body;

    // Giriş verilerini trim ederek temizliyoruz
    full_name = full_name?.trim();
    username = username?.trim();
    email = email?.trim();
    securityQuestion = securityQuestion?.trim();
    securityAnswer = securityAnswer?.trim();

    // Tüm alanların doldurulduğunu kontrol ediyoruz
    if (!full_name || !username || !email || !password || !securityQuestion || !securityAnswer) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Email formatının geçerliliğini kontrol ediyoruz
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    // Şifre için minimum uzunluk kontrolü
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` }, { status: 400 });
    }

    // Email veya username ile kayıtlı kullanıcı kontrolü
    const [existingUsers] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username]
    );
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "Email or Username already exists" }, { status: 400 });
    }

    // Şifre ve securityAnswer hash'leniyor
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer, SALT_ROUNDS);

    // 4 haneli rastgele doğrulama kodu oluşturma
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Kullanıcıyı veritabanına ekliyoruz (is_verified false olarak kalıyor)
    await db.query(
      `INSERT INTO users (
         full_name, username, email, password, verification_code, security_question, security_answer, is_verified, joined_date
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [full_name, username, email, hashedPassword, verificationCode, securityQuestion, hashedSecurityAnswer, false]
    );

    // E-posta gönderimi için Gmail ayarlarını alıyoruz (env üzerinden)
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    if (!gmailUser || !gmailAppPassword) {
      return NextResponse.json({ message: "E-posta ayarları eksik" }, { status: 500 });
    }

    // Nodemailer transporter'ı oluşturuluyor (logger ve debug aktif)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
      logger: true,
      debug: true,
    });

    // E-posta içeriği
    const mailOptions = {
      from: gmailUser,
      to: email,
      subject: "Hesap Doğrulama Kodu",
      text: `
Merhaba ${full_name},

Hesabınızı doğrulamak için doğrulama kodunuz:

${verificationCode}

Lütfen bu kodu doğrulama sayfasına giriniz.
Teşekkürler.
      `,
    };

    // E-posta gönderimi; olası hataları yakalıyoruz
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Eğer e-posta gönderilemezse bile kullanıcı oluşturulmuş olacak
      // Burada ek aksiyonlar (ör. yeniden deneme, loglama) yapılabilir
    }

    return NextResponse.json(
      { message: "User registered successfully. Lütfen e-postanızı kontrol edip doğrulama kodunu giriniz." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Database error", error: String(error) }, { status: 500 });
  }
}
