// ✅ src/app/api/admin/dm-export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const { userId1, userId2, targetDate } = await req.json();

    if (!userId1 || !userId2 || !targetDate) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    // Silinmiş kullanıcı kontrolü ve 2 yıl sınırı
    const [deletedUsers] = await db.query<any[]>(
      `SELECT id, deleted_at FROM deleted_users WHERE id IN (?, ?)`,
      [userId1, userId2]
    );

    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const isTooOld = deletedUsers.some(user => new Date(user.deleted_at) < twoYearsAgo);
    if (isTooOld) {
      return NextResponse.json({ error: "Veriler 2 yılı aştığı için erişilemez." }, { status: 403 });
    }

    // DM verilerini çek
    const [messages] = await db.query<any[]>(
        `SELECT id, senderId, receiverId, message, attachmentUrl, created_at
         FROM dm_messages
         WHERE (
           (senderId = ? AND receiverId = ?) OR
           (senderId = ? AND receiverId = ?)
         )
         AND DATE(created_at) = ?`,
        [userId1, userId2, userId2, userId1, targetDate]
      );
      

    const json = JSON.stringify({
      meta: {
        exported_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        userId1,
        userId2,
        targetDate,
        deletedUsers: deletedUsers.map(u => u.id),
      },
      messages,
    }, null, 2);

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=dm_${userId1}_${userId2}_${targetDate}.json`,
      },
    });
  } catch (error) {
    console.error("Admin DM export hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
