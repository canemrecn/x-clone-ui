import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import fs from "fs";
import os from "os";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, requestType, description } = body;

    if (!name || !email || !requestType) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const [rows]: any = await db.query(
      "SELECT id, full_name, username, email, profile_image, joined_date, is_verified FROM users WHERE email = ?",
      [email]
    );
    const user = rows?.[0];
    if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

    const fileName = `undergo_export_${user.id}_${Date.now()}.json`;
    const filePath = path.join(os.tmpdir(), fileName);

    if (requestType === "veri-goruntuleme" || requestType === "veri-aktarimi") {
      const [posts] = await db.query("SELECT id, title, content, created_at FROM posts WHERE user_id = ?", [user.id]);
      const [comments] = await db.query("SELECT id, post_id, text, created_at FROM comments WHERE user_id = ?", [user.id]);
      const [likes] = await db.query("SELECT post_id, created_at AS liked_at FROM likes WHERE user_id = ?", [user.id]);
      const [followers] = await db.query("SELECT follower_id AS user_id, created_at AS followed_at FROM follows WHERE following_id = ?", [user.id]);
      const [following] = await db.query("SELECT following_id AS user_id, created_at AS followed_at FROM follows WHERE follower_id = ?", [user.id]);
      const [dm_messages] = await db.query("SELECT * FROM dm_messages WHERE senderId = ? OR receiverId = ?", [user.id, user.id]);
      const [notes] = await db.query("SELECT id, text, created_at FROM notes WHERE user_id = ?", [user.id]);
      const [devices] = await db.query("SELECT deviceName, ipAddress, lastLogin FROM user_devices WHERE userId = ?", [user.id]);
      const [translations] = await db.query("SELECT word, translated_to, created_at FROM translated_words WHERE user_id = ?", [user.id]);
      const [activity_logs] = await db.query("SELECT action, ip_address, user_agent, created_at FROM activity_logs WHERE user_id = ?", [user.id]);
      const [notifications] = await db.query("SELECT id, type, from_user_id, post_id, created_at FROM notifications WHERE user_id = ?", [user.id]);

      const jsonData = {
        meta: {
          exported_at: new Date().toISOString(),
          request_type: requestType,
          legal_notice: "Bu veriler 6698 sayılı KVKK kapsamında sadece talep sahibi kişiye sunulmuştur.",
        },
        user,
        posts,
        comments,
        likes,
        followers,
        following,
        dm_messages,
        notes,
        devices,
        translations,
        activity_logs,
        notifications,
        account_status: {
          is_verified: !!user.is_verified,
          joined_date: user.joined_date,
        },
      };

      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: `KVKK Talebi: ${requestType}`,
        text: `Sayın ${name},\n\nTalebiniz doğrultusunda kişisel verileriniz ekteki JSON dosyasında sunulmuştur.`,
        attachments: [{ filename: fileName, path: filePath }],
      });
    }

    if (requestType === "veri-silme") {
      await db.query("UPDATE users SET is_deleted = 1, deleted_at = NOW() WHERE id = ?", [user.id]);
      await db.query(
        "INSERT INTO deleted_users (full_name, username, email, reason) VALUES (?, ?, ?, ?)",
        [user.full_name, user.username, user.email, description || "KVKK talebi"]
      );

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: `KVKK Talebi: Hesap Silme`,
        text: `Sayın ${name},\n\nTalebiniz doğrultusunda hesabınız sistemimizden silinmiştir. Geri dönüş yapılmasını isterseniz destek ekibiyle iletişime geçebilirsiniz.`,
      });
    }

    return NextResponse.json({ message: "İşlem başarıyla gerçekleştirildi." });
  } catch (err) {
    console.error("KVKK API hatası:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
