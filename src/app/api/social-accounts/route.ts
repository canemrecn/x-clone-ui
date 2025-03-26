// src/app/api/social-accounts/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// GET: Kullanıcının sosyal hesaplarını döndürür
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
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
  } catch (error) {
    console.error("Social accounts fetch error:", error);
    return NextResponse.json({ message: "Sosyal hesaplar alınırken hata oluştu." }, { status: 500 });
  }
}

// POST: Yeni sosyal medya hesabını ekler
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    const { platform, accountLink } = await request.json();
    if (!platform || !accountLink) {
      return NextResponse.json({ message: "Platform ve Account Link gereklidir." }, { status: 400 });
    }

    await db.query(
      `INSERT INTO social_accounts (userId, platform, accountLink)
       VALUES (?, ?, ?)`,
      [userId, platform, accountLink]
    );

    return NextResponse.json({ message: "Sosyal hesap başarıyla eklendi." });
  } catch (error) {
    console.error("Social account add error:", error);
    return NextResponse.json({ message: "Sosyal hesap eklenirken hata oluştu." }, { status: 500 });
  }
}

// DELETE: Kullanıcının sosyal medya hesabını siler
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Silme işlemi için body'den sosyal hesap id'sini alıyoruz
    const { id } = await request.json();

    await db.query(
      `DELETE FROM social_accounts WHERE id = ? AND userId = ?`,
      [id, userId]
    );

    return NextResponse.json({ message: "Sosyal hesap başarıyla silindi." });
  } catch (error) {
    console.error("Social account delete error:", error);
    return NextResponse.json({ message: "Sosyal hesap silinirken hata oluştu." }, { status: 500 });
  }
}
