//src/app/api/admin/archived-users/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");

    const decoded = jwt.verify(token, secret) as { id: number; role: string };

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Yetkiniz yok" }, { status: 403 });
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM deleted_users ORDER BY deleted_at DESC`
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    console.error("Arşivlenmiş kullanıcılar alınamadı:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
