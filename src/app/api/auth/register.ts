// File: src/app/api/auth/register.ts
// File: src/app/api/auth/register/route.ts
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";

const SALT_ROUNDS = 10;
// Basit email regex kontrolü (temel düzeyde)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Giriş verilerinin alınması ve temizlenmesi
  let { full_name, username, email, password, securityQuestion, securityAnswer } = req.body;

  full_name = typeof full_name === "string" ? full_name.trim() : "";
  username = typeof username === "string" ? username.trim() : "";
  email = typeof email === "string" ? email.trim() : "";
  securityQuestion = typeof securityQuestion === "string" ? securityQuestion.trim() : "";
  securityAnswer = typeof securityAnswer === "string" ? securityAnswer.trim() : "";

  if (
    !full_name ||
    !username ||
    !email ||
    !password ||
    !securityQuestion ||
    !securityAnswer
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Email format kontrolü
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Email veya username kontrolü
  const [existingUsers]: any = await db.query(
    "SELECT id FROM users WHERE email = ? OR username = ?",
    [email, username]
  );
  if (existingUsers.length > 0) {
    return res
      .status(400)
      .json({ message: "Email or Username already exists" });
  }

  // Parola ve securityAnswer hash'leme
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const hashedSecurityAnswer = await bcrypt.hash(securityAnswer, SALT_ROUNDS);

  // 4 haneli rastgele doğrulama kodu oluşturma
  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

  // Kullanıcıyı veritabanına ekleme
  try {
    await db.query(
      `INSERT INTO users (
         full_name, username, email, password, verification_code, security_question, security_answer, is_verified, joined_date
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [
        full_name,
        username,
        email,
        hashedPassword,
        verificationCode,
        securityQuestion,
        hashedSecurityAnswer,
        false,
      ]
    );
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Database error", error: String(error) });
  }

  // E-posta gönderimi için ayarlar
  // Burada "from" adresi sabit olarak emrecancnzytnl@gmail.com olarak ayarlanmıştır.
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD; // .env'de tanımlı, örn: uygulama şifresi
  if (!gmailAppPassword) {
    return res.status(500).json({ message: "E-posta ayarları eksik" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "emrecancnzytnl@gmail.com", // Gönderen adres sabit
      pass: gmailAppPassword,
    },
    logger: true,
    debug: true,
  });

  const mailOptions = {
    from: "emrecancnzytnl@gmail.com", // Gönderen adres burada sabit
    to: email, // Kullanıcının kayıt sırasında girdiği adres
    subject: "Hesap Doğrulama Kodu",
    text: `
Merhaba ${full_name},

Hesabınızı doğrulamak için doğrulama kodunuz:

${verificationCode}

Lütfen bu kodu doğrulama sayfasına giriniz.
Teşekkürler.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(201).json({
      message:
        "User registered successfully. Lütfen e-postanızı kontrol edip doğrulama kodunu giriniz.",
      email,
    });
  } catch (error) {
    console.error("Email Send Error:", error);
    return res.status(500).json({
      message:
        "User registered but failed to send verification email. Lütfen daha sonra tekrar deneyin.",
      error: String(error),
    });
  }
}
