// src/app/api/auth/login/route.ts
/*
Bu dosya, kullanıcıların e-posta ve şifre ile giriş yapmasını sağlar (POST /api/auth/login).
Başarılı girişte kullanıcıya JWT tokenı HTTP-only cookie olarak gönderilir ve giriş aktivitesi kaydedilir.
*/
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password.trim()
    ) {
      return NextResponse.json(
        { message: "Email ve şifre zorunludur." },
        { status: 400 }
      );
    }

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email.trim()]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "Geçersiz e-posta veya şifre." },
        { status: 401 }
      );
    }

    const user = rows[0];

    // ✅ Önce doğrulama kontrolü ekliyoruz
    if (!user.is_verified) {
      return NextResponse.json(
        { message: "Lütfen önce e-posta adresinizi doğrulayın." },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Geçersiz e-posta veya şifre." },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET tanımlı değil.");

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: "7d" }
    );

    const cookieStore =await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });

    // Aktivite logu kaydediliyor
    const ip = req.headers.get("x-forwarded-for") || "localhost";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await db.query(
      `INSERT INTO activity_logs (user_id, action, ip_address, user_agent)
       VALUES (?, ?, ?, ?)`,
      [user.id, "login", ip, userAgent]
    );

    return NextResponse.json({
      message: "Giriş başarılı.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        points: user.points,
        level: user.level,
        profile_image: user.profile_image,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("🚨 Login error:", error);
    return NextResponse.json(
      { message: error.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}
