// src/app/api/admin/deleted-users/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    // 1️⃣ Token'ı cookie'den al
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Token'ı çöz ve admin mi kontrol et
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");

    const decoded = jwt.verify(token, secret) as { id: number; role: string };

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized - Admin Only" }, { status: 401 });
    }

    // 3️⃣ deleted_users tablosundan verileri al
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        id AS user_id,
        full_name,
        username,
        email,
        reason,
        deleted_at
      FROM deleted_users
      ORDER BY deleted_at DESC
    `);

    return NextResponse.json({ users: rows }, { status: 200 });

  } catch (error: any) {
    console.error("Silinen kullanıcılar alınırken hata:", error);
    return NextResponse.json({ message: "Sunucu hatası", error: error.message }, { status: 500 });
  }
}
