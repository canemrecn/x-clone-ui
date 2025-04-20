// scripts/sendDmData.ts
import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { RowDataPacket } from "mysql2/promise";

dotenv.config();

async function main() {
  const userId = 1; // Başvuran kullanıcı ID'si
  const buddyId = 2; // Mesajlaştığı kişi ID'si
  const date = "2025-04-19"; // Tarih formatı: YYYY-MM-DD

  // 1. Kullanıcının email bilgisini al
  const [userRows] = await db.query<RowDataPacket[]>(
    "SELECT email, full_name FROM users WHERE id = ?",
    [userId]
  );
  const user = userRows[0];
  if (!user) throw new Error("Kullanıcı bulunamadı.");

  // 2. DM mesajlarını çek
  const [messages] = await db.query<RowDataPacket[]>(
    `SELECT senderId, receiverId, message, created_at
     FROM dm_messages
     WHERE 
      ((senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?))
      AND DATE(created_at) = ?
     ORDER BY created_at ASC`,
    [userId, buddyId, buddyId, userId, date]
  );

  // 3. JSON dosyası olarak kaydet
  const jsonPath = path.join(__dirname, "dm_data.json");
  const data = {
    user_id: userId,
    buddy_id: buddyId,
    date,
    messages,
  };
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf-8");

  // 4. E-posta gönder
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Undergo KVKK" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: `DM Kayıtları (${date}) - Kullanıcı ID: ${userId} - Buddy ID: ${buddyId}`,
    text: `${user.full_name},\n\nTalep ettiğiniz DM mesajları ekte yer almaktadır.`,
    attachments: [
      {
        filename: `dm_kayitlari_${date}.json`,
        path: jsonPath,
      },
    ],
  });

  console.log("✅ DM verisi başarıyla gönderildi:", user.email);
}

main().catch((err) => {
  console.error("Hata:", err);
});
