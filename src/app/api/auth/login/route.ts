import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { updateUserPoints } from "@/utils/points";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    // İstek gövdesinden email ve şifre alınması
    const { email, password } = await req.json();

    // Giriş verilerinin tip kontrolü ve boşluk temizliği (input validasyonu)
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return NextResponse.json(
        { message: "Email and password are required and must be valid." },
        { status: 400 }
      );
    }

    // Kullanıcıyı email'e göre veritabanından çekme (hazırlanmış sorgu kullanılarak)
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email.trim()]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "Email not found" },
        { status: 404 }
      );
    }
    const user = rows[0];

    // Şifre doğrulama
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    // Günlük giriş ödülü: +0.5 puan
    // Tarihi YYYY-MM-DD formatında alıyoruz
    const today = new Date().toISOString().slice(0, 10);
    // Eğer kullanıcının son giriş tarihi farklıysa veya ayarlanmadıysa, puan güncellemesi yapıyoruz
    if (!user.last_login_date || user.last_login_date !== today) {
      await updateUserPoints(user.id, 0.5);
      await db.query("UPDATE users SET last_login_date = ? WHERE id = ?", [
        today,
        user.id,
      ]);
    }

    // JWT_SECRET'in tanımlı olup olmadığını kontrol ediyoruz
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    // JWT oluşturma
    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: "1d",
    });

    return NextResponse.json(
      { message: "Login successful", token },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
