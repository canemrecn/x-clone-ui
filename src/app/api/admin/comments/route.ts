// src/app/api/admin/comments/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [comments] = await db.query("SELECT * FROM comments WHERE is_deleted = 0");

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error("Admin yorumları alınırken hata:", error);
    return NextResponse.json({ message: "Yorumlar alınırken hata oluştu" }, { status: 500 });
  }
}
