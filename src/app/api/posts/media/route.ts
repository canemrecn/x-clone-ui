// src/app/api/posts/media/route.ts
/*Bu dosya, ImageKit üzerinden belirli bir medya dosyasının detaylarını almak için kullanılan GET /api/posts/media 
endpoint’ini tanımlar. Sabit bir fileId ile ImageKit’ten dosya bilgileri sorgulanır ve başarılıysa dosya detayları 
döndürülür, aksi halde hata mesajı gönderilir. Ayrıca ortam değişkenleri (public/private key) konsola yazdırılarak 
kontrol amaçlı gösterilir.*/
// Environment değişkenlerini kontrol etmek için konsola yazdırıyoruz.
// src/app/api/posts/media/route.ts
// Bu endpoint, ImageKit üzerinden belirli bir dosyanın detaylarını döndürür.
// src/app/api/posts/media/route.ts
// Environment değişkenlerini kontrol etmek için konsola yazdırıyoruz.
console.log("privateKey =>", process.env.IMAGEKIT_PRIVATE_KEY);
console.log("publicKey =>", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);

import { NextResponse } from "next/server";
import { serverImageKit } from "@/utils/server"; // ImageKit sunucu konfigürasyon dosyasından import edilir.

export async function GET(req: Request) {
  try {
    // fileId query parametresinden alınır
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    // ImageKit üzerinden dosya detaylarını çekiyoruz.
    const fileDetails = await serverImageKit.getFileDetails(fileId.trim());

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
