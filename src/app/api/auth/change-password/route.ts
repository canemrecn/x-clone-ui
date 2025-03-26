// src/app/api/auth/change-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    // Yetkilendirme kontrolü
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    // Token doğrulaması yapıp kullanıcı id'sini alalım
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // İstek gövdesinden eski şifre, yeni şifre ve güvenlik cevabını alalım
    const { oldPassword, newPassword, securityAnswer } = await req.json();
    if (!oldPassword || !newPassword || !securityAnswer) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
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

    // Eğer güvenlik cevabı veritabanında yoksa
    if (!user.security_answer) {
      return NextResponse.json(
        { message: "Security answer is not set for this account." },
        { status: 400 }
      );
    }

    // Eski şifre kontrolü
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Current password is incorrect." }, { status: 401 });
    }

    // Güvenlik cevabının kontrolü: Her iki değer dolu olmalı
    const isSecurityAnswerCorrect = await bcrypt.compare(securityAnswer, user.security_answer);
    if (!isSecurityAnswerCorrect) {
      return NextResponse.json({ message: "Security answer is incorrect." }, { status: 401 });
    }

    // Yeni şifreyi hash'leyip güncelleyelim
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, userId]);

    return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ message: "Error changing password." }, { status: 500 });
  }
}
