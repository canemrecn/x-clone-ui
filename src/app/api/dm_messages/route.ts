// src/app/api/dm_messages/route.ts
//Bu dosya, iki kullanıcı arasındaki özel mesajları (DM) getiren bir API endpoint’idir 
//(/api/dm_messages, GET methodu); URL üzerinden gelen buddyId parametresiyle birlikte 
//JWT token aracılığıyla kimliği doğrulanan kullanıcının ID’si alınır, ardından areUsersBlocked 
//fonksiyonu ile kullanıcılar arasında engel (blok) olup olmadığı kontrol edilir. Eğer 
//blok yoksa, bu iki kullanıcı arasında gönderilmiş tüm mesajlar dm_messages tablosundan 
//çekilir ve kronolojik sırayla döndürülür; blok varsa mesajlara erişim engellenir. 
//Hatalı parametre, yetkisiz erişim veya sistem hatalarında uygun hata mesajı ile yanıt verir.
// src/app/api/dm_messages/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { areUsersBlocked } from "@/utils/blockHelpers";
import { getAuthUser } from "@/utils/getAuthUser";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buddyIdParam = searchParams.get("buddyId");
    if (!buddyIdParam) {
      return NextResponse.json({ message: "buddyId param is required" }, { status: 400 });
    }

    const buddyId = Number(buddyIdParam.trim());
    if (isNaN(buddyId)) {
      return NextResponse.json({ message: "Invalid buddyId" }, { status: 400 });
    }

    const user = await getAuthUser(); // ✅ artık parametre yok!
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;

    const blocked = await areUsersBlocked(userId, buddyId);
    if (blocked) {
      return NextResponse.json(
        { message: "Mesajlaşma işlemi gerçekleştirilemez. Kullanıcı ile aranızda blok var." },
        { status: 403 }
      );
    }

    const query = `
      SELECT * 
      FROM dm_messages
      WHERE 
        (senderId = ? AND receiverId = ?)
        OR (senderId = ? AND receiverId = ?)
      ORDER BY created_at ASC
    `;
    const [rows] = await db.query<RowDataPacket[]>(query, [userId, buddyId, buddyId, userId]);

    return NextResponse.json({ messages: rows }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching DM messages:", error);
    return NextResponse.json(
      { message: error.message || "Error fetching messages" },
      { status: 500 }
    );
  }
}
