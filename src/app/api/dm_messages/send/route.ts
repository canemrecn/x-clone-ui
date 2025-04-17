// src/app/api/dm_messages/send/route.ts
//Bu dosya, bir kullanıcının başka bir kullanıcıya belirli bir gönderiye (postId) ait bağlantıyı özel mesaj olarak 
//göndermesini sağlayan bir API endpoint’idir (/api/dm_messages/send, POST methodu); JWT token ile gönderen 
//kullanıcının kimliğini doğrular, alıcı ID’si (toUserId) ve gönderi ID’sini alarak tam bağlantı linkini 
//oluşturur (/post/{postId}) ve bu mesajı dm_messages tablosuna kaydeder. Başarılı işlemde onay mesajı, 
//hatalı veya eksik bilgilerde ya da yetkisiz erişimlerde uygun hata mesajı ile yanıt verir.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserFromRequest } from "@/utils/getAuthUser";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const senderId = user.id;

    const { toUserId, postId } = await request.json();
    if (!toUserId || !postId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const receiverId = Number(toUserId);
    if (isNaN(receiverId)) {
      return NextResponse.json({ error: "Invalid toUserId" }, { status: 400 });
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const message = `${baseUrl}/post/${postId}`;

    const [result] = await db.query(
      "INSERT INTO dm_messages (senderId, receiverId, message) VALUES (?, ?, ?)",
      [senderId, receiverId, message]
    );

    // Aktivite logla
    const ip = request.headers.get("x-forwarded-for") || "localhost";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await db.query(
      "INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
      [
        senderId,
        "message_sent",
        `DM to user ${receiverId}: ${message}`,
        ip,
        userAgent
      ]
    );

    return NextResponse.json({ message: "DM sent successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Send DM error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
