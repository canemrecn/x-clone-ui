import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import crypto from "crypto";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { full_name, username, email, password, securityQuestion, securityAnswer } = body;

    if (!full_name || !username || !email || !password || !securityQuestion || !securityAnswer) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Kullanıcı var mı kontrol edelim.
    const [existingUsers] = await db.query<RowDataPacket[]>(`
      SELECT id FROM users WHERE email = ? OR username = ?
    `, [email, username]);

    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "Email or Username already exists" }, { status: 400 });
    }

    // Şifre ve güvenlik cevabını hash'liyoruz.
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer, 10);
    const verificationCode = crypto.randomBytes(20).toString("hex");

    await db.query(
      `INSERT INTO users (full_name, username, email, password, verification_code, security_question, security_answer, joined_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [full_name, username, email, hashedPassword, verificationCode, securityQuestion, hashedSecurityAnswer]
    );

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Database error", error: String(error) }, { status: 500 });
  }
}
