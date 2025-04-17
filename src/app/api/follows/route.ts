// src/app/api/follows/route.ts
//Bu dosya, kullanıcıların başka kullanıcıları takip etme veya takibi bırakma işlemlerini gerçekleştiren 
//bir API endpoint’idir (/api/follows, POST methodu); JWT token ile kimliği doğrulanan kullanıcının 
//isteği doğrultusunda action değeri "follow" ise daha önce takip etmediyse follows tablosuna kayıt 
//ekler ve aynı zamanda bir takip bildirimi oluşturur, "unfollow" ise ilgili takip kaydını siler. 
//Ayrıca, kullanıcılar arasında engelleme (blok) varsa işlem engellenir. Eksik veya hatalı veri, 
//geçersiz işlem veya yetkisiz erişim durumlarında uygun mesaj ve durum kodlarıyla yanıt verir.
// src/app/api/follows/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { getAuthUserFromRequest } from "@/utils/getAuthUser";
import { areUsersBlocked } from "@/utils/blockHelpers";

export async function POST(req: Request) {
  try {
    const { following_id, action } = await req.json();

    if (!following_id || !action) {
      return NextResponse.json({ message: "Eksik veri" }, { status: 400 });
    }

    // ✅ await ile kullanıldı!
    const user = await getAuthUserFromRequest(); // ✅ await gerekiyor
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const follower_id = user.id;

    // Blok kontrolü
    const blocked = await areUsersBlocked(follower_id, following_id);
    if (blocked) {
      return NextResponse.json(
        { message: "Takip işlemi yapılamaz, kullanıcı engellenmiş." },
        { status: 403 }
      );
    }

    if (action === "follow") {
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1",
        [follower_id, following_id]
      );
      if (rows.length > 0) {
        return NextResponse.json({ message: "Zaten takip ediliyor" }, { status: 200 });
      }

      await db.query(
        "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)",
        [follower_id, following_id]
      );

      await db.query(
        "INSERT INTO notifications (user_id, type, from_user_id, post_id) VALUES (?, 'follow', ?, NULL)",
        [following_id, follower_id]
      );

      return NextResponse.json({ message: "Takip edildi" }, { status: 200 });
    }

    if (action === "unfollow") {
      await db.query(
        "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
        [follower_id, following_id]
      );

      return NextResponse.json({ message: "Takipten çıkıldı" }, { status: 200 });
    }

    return NextResponse.json({ message: "Geçersiz işlem" }, { status: 400 });

  } catch (error: any) {
    console.error("Takip sistemi hatası:", error);
    return NextResponse.json({ message: "Sunucu hatası", error: error.message || "" }, { status: 500 });
  }
}
