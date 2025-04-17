// 📁 src/app/api/daily/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeTextErrors } from "@/lib/analyzeTextErrors"; // ✅ Yeni fonksiyon

export async function GET(req: NextRequest) {
  const user = await getUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, content, lang, error_rate, created_at FROM daily_notes WHERE user_id = ? ORDER BY created_at DESC",
      [user.id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET HATASI:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, lang } = await req.json();

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "İçerik boş olamaz." }, { status: 400 });
  }

  try {
    const { errorRate } = await analyzeTextErrors(content, lang || "en");

    await db.query(
      "INSERT INTO daily_notes (user_id, content, lang, error_rate) VALUES (?, ?, ?, ?)",
      [user.id, content.trim(), lang || "en", errorRate]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST HATASI:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
