// src/app/api/posts/media/route.ts
// Environment değişkenlerini kontrol etmek için konsola yazdırıyoruz.
console.log("privateKey =>", process.env.IMAGEKIT_PRIVATE_KEY);
console.log("publicKey =>", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);

import { NextResponse } from "next/server";
import { serverImageKit } from "@/utils/server"; // ImageKit sunucu konfigürasyon dosyasından import edilir.

export async function GET(req: Request) {
  try {
    // Örnek fileId belirleniyor. (Gelecekte dinamik hale getirilebilir.)
    const fileId = "67cb5124432c4764169ee70c".trim();

    // ImageKit üzerinden dosya detaylarını çekiyoruz.
    const fileDetails = await serverImageKit.getFileDetails(fileId);

    // Eğer dosya detayları alınamazsa, uygun bir mesaj döndürüyoruz.
    if (!fileDetails) {
      return NextResponse.json({ error: "File details not found" }, { status: 404 });
    }

    return NextResponse.json(fileDetails, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching file details:", error);
    return NextResponse.json({ error: error?.message || "Error fetching media details" }, { status: 500 });
  }
}
