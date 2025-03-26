// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    // İstek gövdesinden email, username, securityAnswer ve newPassword değerlerini alalım
    const { email, username, securityAnswer, newPassword } = await req.json();
    if (!email || !username || !securityAnswer || !newPassword) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    // Email ve username ile kullanıcıyı bulalım
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, security_answer FROM users WHERE email = ? AND username = ?",
      [email, username]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    const user = rows[0];

    // Eğer güvenlik cevabı veritabanında yoksa
    if (!user.security_answer) {
      return NextResponse.json(
        { message: "Security answer is not set for this account." },
        { status: 400 }
      );
    }

    // Güvenlik cevabını doğrulayalım
    const isCorrect = await bcrypt.compare(securityAnswer, user.security_answer);
    if (!isCorrect) {
      return NextResponse.json({ message: "Security answer is incorrect." }, { status: 401 });
    }

    // Yeni şifreyi hash'leyip güncelleyelim
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);

    return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Error resetting password." }, { status: 500 });
  }
}
