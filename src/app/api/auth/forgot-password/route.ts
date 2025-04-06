// src/app/api/auth/forgot-password/route.ts
//Bu dosya, şifresini unutan kullanıcıların hesaplarını güvenlik sorusu yoluyla doğrulayarak 
//yeni bir şifre belirlemesini sağlayan bir API endpoint’idir (/api/auth/forgot-password); 
//kullanıcıdan e-posta, kullanıcı adı, güvenlik cevabı ve yeni şifre ister, bilgileri 
//veritabanında doğrular, güvenlik cevabı doğruysa yeni şifreyi hash’leyerek günceller 
//ve başarılı işlem sonrası bilgilendirme mesajı döner. Eksik veya hatalı bilgilerde uyarı 
//mesajları verir, sistemsel hatalarda ise 500 hata kodu ile yanıt verir.
// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: Request) {
  try {
    // İstek gövdesinden gerekli alanları alıyoruz
    const { email, username, securityAnswer, newPassword } = await req.json();
    if (!email || !username || !securityAnswer || !newPassword) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // Yeni şifrenin temel validasyonunu yapalım
    if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters long.` },
        { status: 400 }
      );
    }

    // Email ve username ile kullanıcıyı buluyoruz
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, security_answer FROM users WHERE email = ? AND username = ?",
      [email, username]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }
    const user = rows[0];

    // Kullanıcının güvenlik cevabının ayarlanıp ayarlanmadığını kontrol ediyoruz
    if (!user.security_answer) {
      return NextResponse.json(
        { message: "Security answer is not set for this account." },
        { status: 400 }
      );
    }

    // Girilen güvenlik cevabını doğruluyoruz
    const isCorrect = await bcrypt.compare(securityAnswer, user.security_answer);
    if (!isCorrect) {
      return NextResponse.json(
        { message: "Security answer is incorrect." },
        { status: 401 }
      );
    }

    // Yeni şifreyi hash'leyip veritabanında güncelliyoruz
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      user.id,
    ]);

    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Error resetting password." },
      { status: 500 }
    );
  }
}
