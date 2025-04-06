// src/app/api/users/cover-image/route.ts
/*Bu dosya, bir kullanıcının kapak fotoğrafını güncelleyen bir API endpoint’idir. POST isteğiyle çalışır; istek gövdesinden alınan 
JWT token doğrulanarak kullanıcı ID’si elde edilir, ardından Base64 formatında gelen cover_image verisi ImageKit’e yüklenir ve 
elde edilen görsel URL’si, ilgili kullanıcının users tablosundaki cover_image alanına kaydedilir. Başarılı işlem sonrası güncellenen 
görsel URL’si ile birlikte olumlu bir yanıt döner, hata durumlarında ise uygun hata mesajı ve 500 hatası verilir.*/
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { serverImageKit } from "@/utils/server";

export async function POST(req: Request) {
  try {
    // İstek gövdesinden token ve cover_image bilgilerini alıyoruz.
    const { token: rawToken, cover_image } = await req.json();
    if (!rawToken || !cover_image) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }
    const token = rawToken.toString().trim();

    // JWT token doğrulaması yapılarak kullanıcı ID'si elde ediliyor.
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined in environment variables");

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return NextResponse.json({ message: "Token expired" }, { status: 401 });
      }
      return NextResponse.json({ message: "Invalid token", error: err.message }, { status: 401 });
    }

    const userId = decoded.id;

    // Base64 formatında olup olmadığını kontrol ediyoruz.
    if (!cover_image.startsWith("data:image")) {
      return NextResponse.json({ message: "Invalid image format" }, { status: 400 });
    }

    // ImageKit sunucusu üzerinden kapak fotoğrafı yüklemesi yapılıyor.
    const uploadResponse = await serverImageKit.upload({
      file: cover_image,
      fileName: `cover_${userId}_${Date.now()}.jpg`,
      folder: "/users/cover_images",
    });

    const imageUrl = uploadResponse.url;

    // Kullanıcının cover_image alanı güncelleniyor.
    await db.query("UPDATE users SET cover_image = ? WHERE id = ?", [imageUrl, userId]);

    return NextResponse.json(
      { message: "Cover image updated", imageUrl },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Cover image error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
