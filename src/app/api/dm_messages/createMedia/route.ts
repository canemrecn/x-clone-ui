//src/app/api/dm_messages/createMedia/route.ts
//Bu dosya, kullanıcıların özel mesaj yoluyla görsel veya video 
//dosyaları göndermesini sağlayan bir API endpoint’idir 
//(/api/dm_messages/createMedia, POST methodu); JWT token ile 
//kimliği doğrulanan kullanıcının gönderdiği base64 formatındaki 
//medya verisini alır, ImageKit aracılığıyla sunucuya yükler ve 
//yüklenen medyanın URL’si ile birlikte dm_messages tablosuna 
//mesaj kaydı olarak ekler. İşlem sonunda yeni mesaj verisini 
//döner, eksik veya geçersiz veri ya da yetkisiz erişim 
//durumlarında uygun hata mesajları ve durum kodları ile yanıt verir.
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { cookies } from "next/headers";
import { getImageKitInstance } from "@/lib/imagekit";

async function insertMessage({
  senderId,
  receiverId,
  attachmentUrl,
  attachmentType,
}: {
  senderId: number;
  receiverId: number;
  attachmentUrl: string;
  attachmentType: "image" | "video";
}) {
  const query = `
    INSERT INTO dm_messages (senderId, receiverId, message, attachmentUrl, attachmentType)
    VALUES (?, ?, "", ?, ?)
  `;
  const [result] = await db.query(query, [
    senderId,
    receiverId,
    attachmentUrl,
    attachmentType,
  ]);

  const insertedId = (result as any).insertId;

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM dm_messages WHERE id = ?",
    [insertedId]
  );
  return rows[0];
}

export async function POST(request: NextRequest) {
  try {
    const { attachmentBase64, attachmentType, receiverId } = await request.json();

    if (!attachmentBase64 || !attachmentType || !receiverId || isNaN(Number(receiverId))) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!["image", "video"].includes(attachmentType)) {
      return NextResponse.json({ error: "Invalid attachmentType" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, secret) as { id: number };
    const senderId = decoded.id;

    let base64Str = attachmentBase64;
    const match = base64Str.match(/^data:(.*?);base64,(.*)$/);
    if (match) base64Str = match[2];
    if (!base64Str) {
      return NextResponse.json({ error: "Invalid base64 data" }, { status: 400 });
    }

    const imagekit = getImageKitInstance();
    const fileName = `dm_${Date.now()}_${attachmentType}`;

    const uploadRes = await imagekit.upload({
      file: base64Str,
      fileName,
      folder: "/dm_messages",
    });

    const newMessage = await insertMessage({
      senderId,
      receiverId: Number(receiverId),
      attachmentUrl: uploadRes.url,
      attachmentType: attachmentType as "image" | "video",
    });

    return NextResponse.json({ newMessage }, { status: 200 });
  } catch (err) {
    console.error("createMedia error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
