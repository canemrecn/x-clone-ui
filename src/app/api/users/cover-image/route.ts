// src/app/api/users/cover-image/route.ts
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
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // ImageKit sunucusu üzerinden kapak fotoğrafı yüklemesi yapılıyor.
    // cover_image, beklenen formatta (ör. Base64 string) sağlanmalıdır.
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
