// src/app/api/dm_messages/send/route.ts
/*
Bu dosya, bir kullanıcının başka bir kullanıcıya belirli bir gönderiye (postId) ait bağlantıyı
özel mesaj olarak göndermesini sağlayan /api/dm_messages/send endpoint’idir.
JWT ile kullanıcı kimliği doğrulanır, alıcı ID’si ve gönderi ID’si alınır,
bağlantı oluşturulur ve dm_messages tablosuna kaydedilir.
Başarıda 200, hatalarda uygun hata kodları döner.
*/
// src/app/api/dm_messages/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/utils/getAuthUser";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(); // ✅ parametre almıyor!
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const senderId = user.id;

    const { toUserId, postId } = await request.json();

    if (!toUserId || !postId) {
      return NextResponse.json({ error: "toUserId ve postId alanları zorunludur." }, { status: 400 });
    }

    const receiverId = Number(toUserId);
    if (isNaN(receiverId)) {
      return NextResponse.json({ error: "Geçersiz alıcı kullanıcı ID'si." }, { status: 400 });
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const messageLink = `${baseUrl}/post/${postId}`;

    await db.query(
      `INSERT INTO dm_messages (senderId, receiverId, message) VALUES (?, ?, ?)`,
      [senderId, receiverId, messageLink]
    );

    const ip = request.headers.get("x-forwarded-for") || "localhost";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await db.query(
      `INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [
        senderId,
        "message_sent",
        `DM to user ${receiverId}: ${messageLink}`,
        ip,
        userAgent,
      ]
    );

    return NextResponse.json({ message: "Mesaj başarıyla gönderildi." }, { status: 200 });
  } catch (error: any) {
    console.error("🚨 Send DM Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
