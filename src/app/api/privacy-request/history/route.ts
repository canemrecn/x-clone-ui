//src/app/api/privacy-request/history/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/utils/getAuthUser";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [rows] = await db.query(
      "SELECT id, request_type, description, created_at FROM kvkk_requests WHERE email = (SELECT email FROM users WHERE id = ?) ORDER BY created_at DESC",
      [user.id]
    );

    return NextResponse.json({ requests: rows });
  } catch (err) {
    console.error("KVKK geçmişi hatası:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
