import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

/**
 * POST /api/dm_messages/markRead
 * Body: { fromUserId: number }
 * 
 * Gönderici "fromUserId" olan ve alıcısı ben (token'dan gelen userId)
 * olan tüm mesajları okunmuş (isRead=1) yapar.
 */
export async function POST(request: NextRequest) {
  try {
    // 1) Kimlik doğrulama
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Token değeri trim edilerek temizleniyor
    const token = authHeader.split(" ")[1].trim();

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const myId = decoded.id; // Benim userId

    // 2) Body'den "fromUserId" al ve tip kontrolü yap
    const body = await request.json();
    const { fromUserId } = body;
    if (fromUserId === undefined || fromUserId === null) {
      return NextResponse.json({ message: "Missing fromUserId" }, { status: 400 });
    }
    // Opsiyonel: fromUserId'nin sayısal değer olduğundan emin olun
    const senderId = Number(fromUserId);
    if (isNaN(senderId)) {
      return NextResponse.json({ message: "Invalid fromUserId" }, { status: 400 });
    }

    // 3) Veritabanında isRead=0 olan mesajları isRead=1 yap
    // senderId = fromUserId, receiverId = myId
    const updateQuery = `
      UPDATE dm_messages
      SET isRead = 1
      WHERE senderId = ?
        AND receiverId = ?
        AND isRead = 0
    `;
    await db.query(updateQuery, [senderId, myId]);

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error: any) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
