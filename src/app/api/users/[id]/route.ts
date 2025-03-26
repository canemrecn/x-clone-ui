// src/app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // URL parametresinde kullanıcı ID'sinin varlığı kontrol ediliyor.
    if (!params || !params.id) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    // Kullanıcı ID'si trim edilip sayısal değere dönüştürülüyor.
    const trimmedId = params.id.trim();
    const userId = parseInt(trimmedId, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    // Veritabanından kullanıcı bilgileri çekiliyor.
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, username FROM users WHERE id = ?",
      [userId]
    );

    // Kullanıcı bulunamazsa 404 dönülüyor.
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error fetching user:", error);
    return NextResponse.json(
      { message: "Error fetching user", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
