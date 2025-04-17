// src/app/api/users/profile-image/route.ts
/*Bu dosya, kullanıcının profil fotoğrafını güncelleyen bir POST API endpoint'idir. Gelen istekteki JWT token doğrulanarak kullanıcı ID’si 
alınır, ardından profile_image verisi ImageKit’e yüklenir ve elde edilen görsel URL'si veritabanındaki users tablosuna kaydedilir. İşlem 
başarıyla tamamlandığında güncellenen görselin URL'siyle birlikte başarı mesajı döndürülür.*/
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serverImageKit } from "@/utils/server";
import { getAuthUser } from "@/utils/getAuthUser";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(); // Artık req parametresine gerek yok
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { profile_image } = await req.json();
    if (!profile_image) {
      return NextResponse.json({ message: "Profil resmi eksik" }, { status: 400 });
    }

    const uploadResponse = await serverImageKit.upload({
      file: profile_image,
      fileName: `profile_${user.id}_${Date.now()}.jpg`,
      folder: "/users/profile_images",
    });

    const imageUrl = uploadResponse.url;

    await db.query("UPDATE users SET profile_image = ? WHERE id = ?", [imageUrl, user.id]);

    return NextResponse.json({ message: "Profil resmi güncellendi", imageUrl }, { status: 200 });
  } catch (error: any) {
    console.error("Profile image error:", error);
    return NextResponse.json({ message: "Sunucu hatası", error: error.message || "Bilinmeyen hata" }, { status: 500 });
  }
}
