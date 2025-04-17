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
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { RowDataPacket } from "mysql2/promise";

// ✅ GET: Kullanıcının bildirimlerini getirir
export async function GET() {
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Token bulunamadı" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

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
    return NextResponse.json({ message: "Sunucu hatası", error: error.message }, { status: 500 });
  }
}

// ✅ DELETE: Bildirim silme
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: "Notification ID gerekli" }, { status: 400 });
    }

    await db.query("DELETE FROM notifications WHERE id = ?", [id]);

    return NextResponse.json({ message: "Bildirim silindi" }, { status: 200 });
  } catch (error: any) {
    console.error("Delete notification error:", error);
    return NextResponse.json({ message: "Sunucu hatası", error: error.message }, { status: 500 });
  }
}
