// ✅ src/app/api/dm-data-request/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: Request) {
  try {
    const { userId, otherUserId, targetDate, email } = await req.json();

    if (!userId || !otherUserId || !targetDate || !email) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const [rows] = await db.query(
      `SELECT id, senderId, receiverId, message, attachmentUrl, created_at
       FROM dm_messages
       WHERE (
         (senderId = ? AND receiverId = ?) OR
         (senderId = ? AND receiverId = ?)
       )
       AND DATE(created_at) = ?`,
      [userId, otherUserId, otherUserId, userId, targetDate]
    );

    // DM verilerini JSON formatına çevir
    const jsonContent = JSON.stringify(
      {
        userId,
        otherUserId,
        date: targetDate,
        messages: rows,
      },
      null,
      2
    );

    // Geçici dosya oluştur
    const tmpPath = path.join(os.tmpdir(), `dm_${userId}_${otherUserId}_${targetDate}.json`);
    fs.writeFileSync(tmpPath, jsonContent);

    // Mail gönderimi
    const gmailUser = process.env.GMAIL_USER!;
    const gmailPass = process.env.GMAIL_APP_PASSWORD!;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    await transporter.sendMail({
      from: gmailUser,
      to: email,
      subject: "📩 DM Mesaj Verileriniz",
      text: `Merhaba, ${targetDate} tarihli özel mesaj verileriniz ekte yer almaktadır.`,
      attachments: [
        {
          filename: `dm_${userId}_${otherUserId}_${targetDate}.json`,
          path: tmpPath,
        },
      ],
    });

    return NextResponse.json({ message: "✅ Veri JSON olarak gönderildi." }, { status: 200 });
  } catch (error) {
    console.error("DM veri talebi hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
