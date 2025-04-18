// src/jobs/warningEmails.ts
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

export async function sendDeletionWarnings() {
  const thresholdDate = new Date();
  thresholdDate.setFullYear(thresholdDate.getFullYear() - 2);
  thresholdDate.setDate(thresholdDate.getDate() + 30); // 30 gün öncesi

  const [usersToNotify] = await db.query(
    "SELECT email FROM users WHERE is_deleted = 1 AND deleted_at < ?",
    [thresholdDate]
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  for (const user of usersToNotify as any[]) {
    await transporter.sendMail({
      to: user.email,
      subject: "Hesabınız Silinmek Üzere",
      text: `Sayın kullanıcı,

Undergo hesabınız 30 gün içinde kalıcı olarak silinecektir.
Eğer bu hesabı geri almak isterseniz lütfen bizimle iletişime geçin.

Teşekkürler.
Undergo Ekibi`,
    });
  }

  console.log("✅ 30 gün kala silinecek kullanıcılar bilgilendirildi.");
}