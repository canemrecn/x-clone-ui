//src/app/api/warnings/history/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number; role: string };

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Admin access only" }, { status: 403 });
    }

    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        uw.id,
        uw.user_id,
        uw.post_id,
        uw.comment_id,
        u.username,
        u.full_name,
        uw.reason,
        uw.severity,
        uw.triggered_by,
        uw.seen,
        uw.created_at
      FROM user_warnings uw
      LEFT JOIN users u ON uw.user_id = u.id
      ORDER BY uw.created_at DESC
    `);

    return NextResponse.json({ warnings: rows }, { status: 200 });
  } catch (error: any) {
    console.error("Warning history fetch error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}