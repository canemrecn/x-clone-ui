// src/app/api/dm_messages/send/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    // Authorization header'dan token'ı alın (Bearer token kullanılıyor)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Token değeri trim edilerek temizleniyor
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined in environment variables");
    const decoded = jwt.verify(token, secret) as { id: number };
    const senderId = decoded.id;

    // İstek gövdesinden gerekli alanları alın
    const { toUserId, postId } = await request.json();
    if (!toUserId || !postId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    // Opsiyonel: toUserId ve postId'nin sayısal olduğundan emin olunabilir
    const receiverId = Number(toUserId);
    if (isNaN(receiverId)) {
      return NextResponse.json({ error: "Invalid toUserId" }, { status: 400 });
    }

    // Base URL (örneğin, production veya development URL'niz)
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";

    // Mesaj içeriğini oluşturun; artık gönderi ID'si yerine tam bir link oluşturuluyor.
    const message = `${baseUrl}/post/${postId}`;

    // Gerçek değerler ile sorguyu çalıştırın.
    await db.query(
      "INSERT INTO dm_messages (senderId, receiverId, message) VALUES (?, ?, ?)",
      [senderId, receiverId, message]
    );

    return NextResponse.json({ message: "DM sent successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Send DM error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
