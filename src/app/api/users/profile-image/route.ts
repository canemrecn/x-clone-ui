// src/app/api/users/profile-image/route.ts
/*Bu dosya, kullanıcının profil fotoğrafını güncelleyen bir POST API endpoint'idir. Gelen istekteki JWT token doğrulanarak kullanıcı ID’si 
alınır, ardından profile_image verisi ImageKit’e yüklenir ve elde edilen görsel URL'si veritabanındaki users tablosuna kaydedilir. İşlem 
başarıyla tamamlandığında güncellenen görselin URL'siyle birlikte başarı mesajı döndürülür.*/
// src/app/api/users/profile-image/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { serverImageKit } from "@/utils/server"; // 🔥 Artık hata vermeyecek!

export async function POST(req: Request) {
  try {
    // İstek gövdesinden token ve profile_image bilgilerini alıyoruz.
    const { token: rawToken, profile_image } = await req.json();
    if (!rawToken || !profile_image) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const token = rawToken.toString().trim();

    // JWT doğrulaması yapılarak kullanıcı ID'si elde ediliyor.
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined in environment variables");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // ImageKit üzerinden profil resmi yüklemesi yapılıyor.
    const uploadResponse = await serverImageKit.upload({
      file: profile_image,
      fileName: `profile_${userId}_${Date.now()}.jpg`,
      folder: "/users/profile_images",
    });

    const imageUrl = uploadResponse.url;

    // Kullanıcının profil resmi, veritabanında güncelleniyor.
    await db.query("UPDATE users SET profile_image = ? WHERE id = ?", [imageUrl, userId]);

    return NextResponse.json({ message: "Profile image updated", imageUrl }, { status: 200 });
  } catch (error: any) {
    console.error("Profile image error:", error);
    return NextResponse.json({ message: "Server error", error: error.message || "Unknown error" }, { status: 500 });
  }
}
