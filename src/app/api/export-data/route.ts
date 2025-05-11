// ✅ src/app/api/export-data/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // ✅ Kullanıcı bilgisi
    const [userRows] = await db.query<RowDataPacket[]>(
      "SELECT id, full_name, username, email, created_at FROM users WHERE id = ?",
      [userId]
    );
    const user = userRows[0];

    // ✅ Gönderiler
    const [postRows] = await db.query<RowDataPacket[]>(
      "SELECT id, title, content, created_at FROM posts WHERE user_id = ? AND is_deleted = 0",
      [userId]
    );

    // ✅ Yorumlar
    const [commentRows] = await db.query<RowDataPacket[]>(
      "SELECT id, text, created_at FROM comments WHERE user_id = ? AND is_deleted = 0",
      [userId]
    );

    // JSON çıktısı
    const jsonData = {
      user,
      posts: postRows,
      comments: commentRows,
    };

    const blob = Buffer.from(JSON.stringify(jsonData, null, 2), "utf-8");

    return new Response(blob, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=undergo_kisisel_veriler.json",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
