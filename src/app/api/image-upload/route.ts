//src/app/api/image-upload/route.ts
//Bu dosya, istemciden gelen görsel veya video dosyasını ImageKit servisine yükleyen bir API endpoint’idir 
//(/api/image-upload, POST methodu); gelen multipart/form-data içindeki file verisini alır, Buffer formatına 
//çevirerek ImageKit’e yükler ve başarılı işlem sonucunda yüklenen dosyanın URL’sini ve dosya türünü JSON 
//olarak döner. Eksik dosya ya da sistem hatası durumunda uygun hata mesajı ve durum kodu ile yanıt verir.
// src/app/api/image-upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getImageKitInstance } from "@/lib/imagekit";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "500mb",
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    const token = tokenMatch?.[1];
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, secret) as { id: number };
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imagekit = getImageKitInstance();

    const uploadResult = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: "/uploads",
      responseFields: ["url", "fileType", "thumbnailUrl"],
      useUniqueFileName: true,
    });

    return NextResponse.json(
      {
        url: uploadResult.url,
        fileType: file.type,
        uploadedBy: decoded.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      {
        message: "Image upload failed",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
