// src/app/api/notifications/route.ts
//Bu dosya, kullanıcıya ait bildirimleri yönetmek için kullanılan bir API endpoint’idir (/api/notifications). 
//GET isteğinde, JWT ile kimliği doğrulanan kullanıcının tüm bildirimlerini, bildirimi gönderen kullanıcı 
//bilgileri (kullanıcı adı ve profil fotoğrafı) ile birlikte veritabanından çekip en son oluşturulana göre 
//sıralı şekilde döner. DELETE isteğinde ise, gönderilen bildirim ID'sine karşılık gelen bildirimi siler. 
//Her iki işlemde de güvenlik için JWT doğrulama ve parametrik SQL sorguları kullanılır.
// src/app/api/notifications/route.ts
//Bu dosya, kullanıcıya ait bildirimleri yönetmek için kullanılan bir API endpoint’idir (/api/notifications). 
//GET: JWT doğrulamasıyla kullanıcının tüm bildirimlerini getirir. 
//DELETE: Bildirim ID ile belirtilen bildirimi siler.

// src/app/api/notifications/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2/promise";

// GET: Kullanıcının bildirimlerini getirir.
export async function GET(req: Request) {
  try {
    // Authorization header kontrolü
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Token değeri trim edilerek temizleniyor
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Kullanıcının bildirimlerini, bildirimi oluşturan kullanıcı bilgileri ile birlikte getiriyoruz.
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        n.*,
        u.username       AS from_username,
        u.profile_image  AS from_profile_image
      FROM notifications n
      LEFT JOIN users u ON n.from_user_id = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
    `, [userId]);

    return NextResponse.json({ notifications: rows }, { status: 200 });
  } catch (error: any) {
    console.error("Notifications error:", error);
    return NextResponse.json({ message: "Server error", error: error.message || "" }, { status: 500 });
  }
}

// DELETE: Belirtilen bildirim ID'sine sahip bildirimi siler.
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: "Notification ID required" }, { status: 400 });
    }

    // Parametrik sorgu kullanarak SQL enjeksiyon riskini azaltıyoruz.
    await db.query("DELETE FROM notifications WHERE id = ?", [id]);

    return NextResponse.json({ message: "Notification deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("Delete notification error:", error);
    return NextResponse.json({ message: "Server error", error: error.message || "" }, { status: 500 });
  }
}
