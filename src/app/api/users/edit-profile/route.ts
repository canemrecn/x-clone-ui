// app/api/users/edit-profile/route.ts
/*Bu dosya, JWT ile kimliği doğrulanan kullanıcının profil bilgilerini (ad-soyad ve kullanıcı adı) güncellemesini sağlayan bir POST endpoint’idir. 
Authorization header üzerinden alınan token doğrulanarak kullanıcı ID’si elde edilir, ardından istek gövdesinden gelen full_name ve username 
verileri temizlenip users tablosunda güncellenir. Başarılıysa "Profil güncellendi" mesajı döner, hata oluşursa uygun hata mesajıyla birlikte 
500 hatası döner.*/
// src/app/api/users/edit-profile/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    // Authorization header'dan token alınır.
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Token değeri trim edilerek temizleniyor.
    const token = authHeader.split(" ")[1].trim();

    // JWT_SECRET kontrol edilir.
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    // Token doğrulanarak kullanıcı ID'si elde edilir.
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // İstek gövdesinden güncellenecek alanlar (full_name, username) alınır.
    const { full_name, username } = await request.json();
    if (!full_name || !username) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Gelen veriler trim edilerek temizlenir.
    const cleanedFullName = full_name.toString().trim();
    const cleanedUsername = username.toString().trim();

    // Kullanıcı adı benzersiz olmalı ve uygun formatta olmalıdır (isteğe bağlı ekleme yapılabilir)
    if (cleanedUsername.length < 3 || cleanedUsername.length > 20) {
      return NextResponse.json({ message: "Username must be between 3 and 20 characters" }, { status: 400 });
    }

    // Veritabanında kullanıcının profil bilgileri güncellenir.
    await db.query(
      'UPDATE users SET full_name = ?, username = ? WHERE id = ?',
      [cleanedFullName, cleanedUsername, userId]
    );

    return NextResponse.json({ message: "Profil güncellendi." });
  } catch (error: any) {
    console.error("Profil güncelleme hatası:", error);
    return NextResponse.json(
      { message: "Güncelleme sırasında hata oluştu.", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
