// src/app/api/users/profile-info/route.ts
/*Bu dosya, kullanıcının profil açıklamasını (profile_info) güncelleyen bir POST API endpoint’idir. JWT token doğrulanarak kullanıcı kimliği alınır, 
ardından gelen açıklama metni temizlenir ve users tablosundaki ilgili kullanıcının profile_info alanı güncellenir. Başarılı işlem sonunda “Profile 
info updated” mesajı döndürülür.*/
// src/app/api/users/profile-info/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    // İstek gövdesinden token ve profile_info bilgilerini alıyoruz.
    const { token: rawToken, profile_info } = await req.json();
    if (!rawToken || !profile_info) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Token değeri trim edilerek temizleniyor.
    const token = rawToken.toString().trim();

    // JWT doğrulaması yapılarak kullanıcı ID'si elde ediliyor.
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // profile_info değeri temizlenip, gereksiz boşluklardan arındırılıyor.
    const cleanedProfileInfo = profile_info.toString().trim();

    // Kullanıcının profile_info alanı veritabanında güncelleniyor.
    await db.query("UPDATE users SET profile_info = ? WHERE id = ?", [
      cleanedProfileInfo,
      userId,
    ]);

    return NextResponse.json({ message: "Profile info updated" }, { status: 200 });
  } catch (error: any) {
    console.error("Profile info error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
