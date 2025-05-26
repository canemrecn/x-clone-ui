// src/app/api/admin/reported-posts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.id, r.post_id, r.reason, r.created_at,
        p.title, p.content, p.media_url, p.media_type,
        u.username, u.full_name
      FROM reports r
      LEFT JOIN posts p ON r.post_id = p.id
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY r.created_at DESC
    `);

    return NextResponse.json({ reports: rows }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/reported-posts error:", err);
    return NextResponse.json(
      { error: "Şikayet listesi alınamadı", message: err.message },
      { status: 500 }
    );
  }
}
