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
// src/app/api/dm_messages/createMedia/route.ts
import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db"; // Örnek DB bağlantısı (mysql2/promise)
import { RowDataPacket } from "mysql2/promise";

// ImageKit yapılandırması
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

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

    if (!attachmentBase64 || !attachmentType) {
      return NextResponse.json(
        { error: "Missing attachment data or type" },
        { status: 400 }
      );
    }

    if (!["image", "video"].includes(attachmentType)) {
      return NextResponse.json({ error: "Invalid attachmentType" }, { status: 400 });
    }

    if (!receiverId || isNaN(Number(receiverId))) {
      return NextResponse.json({ error: "Invalid receiverId" }, { status: 400 });
    }

    // ✅ Authorization header ile token al
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "JWT_SECRET not defined" }, { status: 500 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret) as { id: number };
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const senderId = decoded.id;

    // Base64 verisini ayrıştır
    let base64Str = attachmentBase64;
    const match = base64Str.match(/^data:(.*?);base64,(.*)$/);
    if (match) {
      base64Str = match[2];
    }

    if (!base64Str) {
      return NextResponse.json({ error: "Invalid attachment data" }, { status: 400 });
    }

    const fileName = `dm_${Date.now()}_${attachmentType}`;

    // ImageKit'e yükle
    const uploadRes = await imagekit.upload({
      file: base64Str,
      fileName,
      folder: "/dm_messages",
    });

    // Veritabanına ekle
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
