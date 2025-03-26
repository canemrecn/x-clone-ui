// src/app/api/auth/verification/route.ts
// src/app/api/auth/verification/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

// Basit email regex kontrolü (temel düzeyde)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail, verificationCode } = await req.json();

    // Giriş verilerini trim ediyoruz
    const email = rawEmail?.toString().trim();
    if (!email || !verificationCode) {
      return NextResponse.json(
        { error: "Email ve verificationCode gereklidir" },
        { status: 400 }
      );
    }
    // Email format kontrolü
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir email adresi giriniz" },
        { status: 400 }
      );
    }

    // Kayıtlı kullanıcıyı email'e göre getiriyoruz
    const [users] = await db.query<RowDataPacket[]>(
      "SELECT id, verification_code, is_verified FROM users WHERE email = ?",
      [email]
    );
    if (users.length === 0) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }
    const user = users[0];

    if (user.is_verified) {
      return NextResponse.json({ message: "Kullanıcı zaten doğrulanmış." });
    }

    if (user.verification_code !== verificationCode) {
      return NextResponse.json({ error: "Geçersiz doğrulama kodu" }, { status: 400 });
    }

    // Kullanıcının doğrulama durumu güncelleniyor
    await db.query("UPDATE users SET is_verified = ? WHERE id = ?", [true, user.id]);

    // (Performans önerisi: "users" tablosunda email sütununa indeks eklemek sorgu hızını artırır.)
    return NextResponse.json({ message: "Kullanıcı başarıyla doğrulandı." }, { status: 200 });
  } catch (err: any) {
    console.error("Verification endpoint error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
