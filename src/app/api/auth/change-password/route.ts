// src/app/api/auth/change-password/route.ts
//Bu dosya, kullanıcıların şifrelerini değiştirmesine olanak 
//tanıyan güvenli bir API endpoint’idir (/api/auth/change-password); 
//JWT token ile kimlik doğrulaması yapar, kullanıcının mevcut 
//şifresini ve güvenlik sorusu cevabını kontrol eder, yeni şifreyi 
//minimum 8 karakter uzunluk şartıyla hash'leyerek veritabanında 
//günceller ve başarılı işlem sonrası bilgi mesajı döner. Hatalı 
//girişlerde detaylı uyarılar verir ve sistemsel sorunlarda 500 
//hatası gönderir.
// src/app/api/auth/change-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: Request) {
  try {
    // Authorization header kontrolü
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    // Token doğrulaması yapıp kullanıcı ID'sini elde edelim
    let decoded;
    try {
      decoded = jwt.verify(token, secret) as { id: number };
    } catch (tokenError) {
      return NextResponse.json({ message: "Invalid or expired token." }, { status: 401 });
    }
    const userId = decoded.id;

    // İstek gövdesinden gerekli alanları alalım
    const { oldPassword, newPassword, securityAnswer } = await req.json();
    if (!oldPassword || !newPassword || !securityAnswer) {
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

    // Kullanıcının mevcut şifresini ve güvenlik cevabını veritabanından çekelim
    const [rows] = await db.query<RowDataPacket[]>( 
      "SELECT password, security_answer FROM users WHERE id = ?",
      [userId]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    const user = rows[0];

    // Kullanıcının güvenlik cevabının ayarlanıp ayarlanmadığını kontrol edelim
    if (!user.security_answer) {
      return NextResponse.json(
        { message: "Security answer is not set for this account." },
        { status: 400 }
      );
    }

    // Eski şifrenin doğruluğunu kontrol edelim
    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordCorrect) {
      return NextResponse.json(
        { message: "Current password is incorrect." },
        { status: 401 }
      );
    }

    // Güvenlik cevabının doğruluğunu kontrol edelim
    const isSecurityAnswerCorrect = await bcrypt.compare(securityAnswer, user.security_answer);
    if (!isSecurityAnswerCorrect) {
      return NextResponse.json(
        { message: "Security answer is incorrect." },
        { status: 401 }
      );
    }

    // Yeni şifreyi hash'leyip güncelleyelim
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, userId]);

    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: "Error changing password." },
      { status: 500 }
    );
  }
}
