// src/app/api/social-accounts/route.ts
/*Bu dosya, kullanıcıların sosyal medya hesaplarını yönetmesini sağlayan bir API endpoint’idir. JWT ile kimlik 
doğrulaması yaparak; GET metoduyla kullanıcının eklemiş olduğu sosyal hesapları listeleyen, POST metoduyla yeni 
bir sosyal medya hesabı (platform adı ve bağlantı) ekleyen, DELETE metoduyla ise yalnızca kendisine ait olan 
sosyal hesap kaydını silen işlemleri güvenli bir şekilde gerçekleştirir.*/
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { cookies } from "next/headers";

/**
 * GET: Kullanıcının sosyal hesaplarını döndürür.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT id, platform, accountLink, created_at
      FROM social_accounts
      WHERE userId = ?
      ORDER BY created_at DESC
    `, [userId]);

    return NextResponse.json({ socialAccounts: rows }, { status: 200 });
  } catch (error: any) {
    console.error("Social accounts fetch error:", error);
    return NextResponse.json({ message: "Sosyal hesaplar alınırken hata oluştu.", error: error.message || "" }, { status: 500 });
  }
}

/**
 * POST: Yeni sosyal medya hesabını ekler.
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    const { platform, accountLink } = await request.json();
    if (!platform || !accountLink) {
      return NextResponse.json({ message: "Platform ve Account Link gereklidir." }, { status: 400 });
    }

    await db.query(
      `INSERT INTO social_accounts (userId, platform, accountLink) VALUES (?, ?, ?)`,
      [userId, platform, accountLink]
    );

    return NextResponse.json({ message: "Sosyal hesap başarıyla eklendi." });
  } catch (error: any) {
    console.error("Social account add error:", error);
    return NextResponse.json({ message: "Sosyal hesap eklenirken hata oluştu.", error: error.message || "" }, { status: 500 });
  }
}

/**
 * DELETE: Kullanıcının sosyal medya hesabını siler.
 */
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ message: "Sosyal hesap ID gereklidir." }, { status: 400 });
    }

    await db.query(`DELETE FROM social_accounts WHERE id = ? AND userId = ?`, [id, userId]);

    return NextResponse.json({ message: "Sosyal hesap başarıyla silindi." });
  } catch (error: any) {
    console.error("Social account delete error:", error);
    return NextResponse.json({ message: "Sosyal hesap silinirken hata oluştu.", error: error.message || "" }, { status: 500 });
  }
}
