import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db"; // Örnek DB bağlantısı (mysql2/promise)
import { RowDataPacket } from "mysql2/promise";

// ImageKit yapılandırması: Eksik ortam değişkenleri varsa hata fırlatılabilir.
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

// Örnek DB ekleme fonksiyonu
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
  // created_at'i manuel eklemiyoruz; MySQL otomatik dolduracak
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

  // Eklenen satırın ID'sini al
  const insertedId = (result as any).insertId;

  // Yeni eklenen satırı geri çekmek isterseniz:
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM dm_messages WHERE id = ?",
    [insertedId]
  );
  return rows[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attachmentBase64, attachmentType, receiverId } = body;

    // Gerekli parametrelerin varlığını kontrol ediyoruz
    if (!attachmentBase64 || !attachmentType) {
      return NextResponse.json(
        { error: "Missing attachment data or type" },
        { status: 400 }
      );
    }
    // Valid attachmentType kontrolü
    if (!["image", "video"].includes(attachmentType)) {
      return NextResponse.json({ error: "Invalid attachmentType" }, { status: 400 });
    }
    // receiverId doğrulaması: receiverId'nin geçerli bir sayı olduğundan emin oluyoruz.
    if (!receiverId || isNaN(Number(receiverId))) {
      return NextResponse.json({ error: "Invalid receiverId" }, { status: 400 });
    }

    // Kimlik doğrulama: Authorization header kontrolü
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Token değerini trim ederek temizliyoruz
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    const decoded = jwt.verify(token, secret) as { id: number };
    const senderId = decoded.id; // Artık senderId doğru şekilde elde ediliyor

    // Mesaj içeriğinin boşluklardan arındırılması (attachmentBase64 verisinin işlenmesi)
    let base64Str = attachmentBase64;
    const match = base64Str.match(/^data:(.*?);base64,(.*)$/);
    if (match) {
      base64Str = match[2];
    }
    // Ek: base64Str'in boş olmadığından emin olun
    if (!base64Str) {
      return NextResponse.json({ error: "Invalid attachment data" }, { status: 400 });
    }
    // Dosya adını oluştururken, dosya türüne uygun uzantı eklemek isteğe bağlıdır
    const fileName = `dm_${Date.now()}_${attachmentType}`;

    // ImageKit'e yükleme işlemi
    const uploadRes = await imagekit.upload({
      file: base64Str,
      fileName: fileName,
      folder: "/dm_messages",
    });

    // DB'ye eklemeden önce receiverId'yi sayıya çeviriyoruz
    const newMessage = await insertMessage({
      senderId,
      receiverId: Number(receiverId),
      attachmentUrl: uploadRes.url,
      attachmentType: attachmentType as "image" | "video",
    });

    return NextResponse.json({ newMessage }, { status: 200 });
  } catch (err: any) {
    console.error("createMedia error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
