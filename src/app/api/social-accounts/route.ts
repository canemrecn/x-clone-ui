// src/app/api/social-accounts/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

/**
 * GET: Kullanıcının sosyal hesaplarını döndürür.
 */
export async function GET(request: Request) {
  try {
    // Authorization header kontrolü
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Token temizleniyor
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    
    // JWT doğrulaması ve kullanıcı ID'si alınır
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Sosyal hesaplar, oluşturulma tarihine göre azalan sırayla çekilir.
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
    // Authorization header kontrolü
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    
    // JWT doğrulaması yapılarak kullanıcı ID'si elde edilir.
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // İstek gövdesinden platform ve accountLink alanları alınır.
    const { platform, accountLink } = await request.json();
    if (!platform || !accountLink) {
      return NextResponse.json({ message: "Platform ve Account Link gereklidir." }, { status: 400 });
    }

    // Yeni sosyal hesap, kullanıcıya ait olarak veritabanına eklenir.
    await db.query(
      `INSERT INTO social_accounts (userId, platform, accountLink)
       VALUES (?, ?, ?)`,
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
    // Authorization header kontrolü
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    
    // JWT doğrulaması yapılarak kullanıcı ID'si alınır.
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // İstek gövdesinden silinecek sosyal hesap ID'si alınır.
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ message: "Sosyal hesap ID gereklidir." }, { status: 400 });
    }

    // Sadece ilgili kullanıcıya ait sosyal hesap silinir.
    await db.query(
      `DELETE FROM social_accounts WHERE id = ? AND userId = ?`,
      [id, userId]
    );

    return NextResponse.json({ message: "Sosyal hesap başarıyla silindi." });
  } catch (error: any) {
    console.error("Social account delete error:", error);
    return NextResponse.json({ message: "Sosyal hesap silinirken hata oluştu.", error: error.message || "" }, { status: 500 });
  }
}
