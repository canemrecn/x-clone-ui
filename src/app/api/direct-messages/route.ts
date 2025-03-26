import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listParam = searchParams.get("list");

    // JWT doğrulaması: Oturum açmış kullanıcının bilgisini almak için.
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    if (listParam === "true") {
      // DM Konuşma Listesi: Oturum açmış kullanıcının katıldığı (sender ya da receiver olan)
      // konuşmaları chatId bazında gruplandırıp, son mesaj ve güncellenme zamanını getiriyoruz.
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT 
            chatId,
            GROUP_CONCAT(DISTINCT senderId SEPARATOR ',') AS senderIds,
            GROUP_CONCAT(DISTINCT receiverId SEPARATOR ',') AS receiverIds,
            MAX(created_at) AS updatedAt,
            (SELECT message FROM dm_messages WHERE chatId = dm.chatId ORDER BY created_at DESC LIMIT 1) AS lastMessage
         FROM dm_messages AS dm
         WHERE senderId = ? OR receiverId = ?
         GROUP BY chatId
         ORDER BY updatedAt DESC`,
        [userId, userId]
      );
      return NextResponse.json({ conversations: rows }, { status: 200 });
    } else {
      // Belirli bir chatId'ye ait mesajları getir.
      const chatId = searchParams.get("chatId");
      if (!chatId) {
        return NextResponse.json({ message: "chatId is required" }, { status: 400 });
      }
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM dm_messages WHERE chatId = ? ORDER BY created_at ASC",
        [chatId]
      );
      return NextResponse.json({ messages: rows }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error fetching DM messages:", error);
    return NextResponse.json({ message: error.message || "Error fetching messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { chatId, senderId, receiverId, message } = await request.json();
    if (!chatId || !senderId || !receiverId || !message) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }
    await db.query(
      "INSERT INTO dm_messages (chatId, senderId, receiverId, message) VALUES (?, ?, ?, ?)",
      [chatId, senderId, receiverId, message]
    );
    return NextResponse.json({ message: "Message sent successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Error sending DM message:", error);
    return NextResponse.json({ message: error.message || "Error sending message" }, { status: 500 });
  }
}
