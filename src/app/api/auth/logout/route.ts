// src/app/api/auth/logout/route.ts
/*
Bu dosya, kullanıcıların güvenli şekilde çıkış yapmasını (logout) sağlayan POST /api/auth/logout endpoint'idir.
JWT doğrulaması yapılır, geçerli token silinir ve çıkış işlemi activity_logs tablosuna kaydedilir.
*/

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    let decodedUser: { id: number } | null = null;

    if (token) {
      try {
        decodedUser = jwt.verify(token, secret) as { id: number };
      } catch (err) {
        console.warn("Geçersiz veya süresi dolmuş token ile çıkış yapılıyor.");
      }
    }

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      "token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict"
    );

    if (decodedUser?.id) {
      const ip = req.headers.get("x-forwarded-for") || "localhost";
      const userAgent = req.headers.get("user-agent") || "unknown";

      await db.query(
        `INSERT INTO activity_logs (user_id, action, ip_address, user_agent)
         VALUES (?, ?, ?, ?)`,
        [decodedUser.id, "logout", ip, userAgent]
      );
    }

    return NextResponse.json(
      { message: "Çıkış işlemi başarılı." },
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error("🚨 Logout error:", error);
    return NextResponse.json(
      { message: error.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}
