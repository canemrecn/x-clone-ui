import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { updateUserPoints } from "@/utils/points";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM users WHERE email = ?`, [email]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Email not found" }, { status: 404 });
    }

    const user = rows[0];

    // Şifre doğrulama
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }

    // Günlük giriş ödülü: +0.5 puan
    const today = new Date().toISOString().slice(0, 10);
    if (!user.last_login_date || user.last_login_date !== today) {
      await updateUserPoints(user.id, 0.5);
      await db.query("UPDATE users SET last_login_date = ? WHERE id = ?", [today, user.id]);
    }

    // JWT oluştur
    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: "1d" });

    return NextResponse.json({ message: "Login successful", token }, { status: 200 });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
