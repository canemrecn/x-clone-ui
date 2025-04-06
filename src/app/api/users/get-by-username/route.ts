// src/app/api/users/get-by-username/route.ts
/*Bu dosya, kullanıcı adını (username) sorgu parametresinden alarak ilgili kullanıcının profil bilgilerini döndüren bir GET API endpoint'idir. 
Kullanıcının adı, seviyesi, puanı, profil fotoğrafı, katılım tarihi, biyografi bilgisi, takipçi ve takip ettiği kişi sayısı gibi veriler, 
users tablosu ile user_levels görünümü birleştirilerek alınır. Eğer kullanıcı bulunamazsa 404 hatası döner; başarı durumunda kullanıcı bilgileri 
JSON formatında istemciye iletilir.*/
// src/app/api/users/get-by-username/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(req: Request) {
  try {
    // URL'den query parametrelerini alıyoruz.
    const { searchParams } = new URL(req.url);
    const rawUsername = searchParams.get("username");
    if (!rawUsername) {
      return NextResponse.json({ message: "Username parameter is required" }, { status: 400 });
    }

    // Kullanıcı adını temizliyoruz
    const username = rawUsername.trim();
    if (!username) {
      return NextResponse.json({ message: "Username cannot be empty" }, { status: 400 });
    }

    // Kullanıcı bilgilerini, user_levels görünümü ile birleştirerek çekiyoruz.
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT
        u.id,
        u.full_name,
        u.username,
        ul.level,            -- Kullanıcının seviyesi (user_levels görünümünden geliyor)
        u.points,
        u.profile_image,
        u.joined_date,
        u.profile_info,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS follower_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count
      FROM users u
      LEFT JOIN user_levels ul ON u.id = ul.id
      WHERE u.username = ? 
      LIMIT 1
    `, [username]);

    // Eğer kullanıcı bulunamazsa 404 döndürüyoruz.
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error("get-by-username error:", error);
    return NextResponse.json({ message: "Server error", error: error.message || "Unknown error" }, { status: 500 });
  }
}
