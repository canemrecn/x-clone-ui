// app/api/users/edit-profile/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    // Authorization başlığından token'ı alıyoruz.
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    // Token'ı doğrulayıp kullanıcı id'sini alıyoruz.
    const decoded = jwt.verify(token, secret) as { id: number };

    const { full_name, username } = await request.json();

    // Kullanıcının bilgilerini güncelliyoruz.
    await db.query(
      'UPDATE users SET full_name = ?, username = ? WHERE id = ?',
      [full_name, username, decoded.id]
    );

    return NextResponse.json({ message: "Profil güncellendi." });
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    return NextResponse.json({ message: "Güncelleme sırasında hata oluştu." }, { status: 500 });
  }
}
