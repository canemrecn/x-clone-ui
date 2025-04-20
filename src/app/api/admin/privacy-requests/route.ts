// ✅ src/app/api/admin/privacy-requests/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM privacy_requests ORDER BY created_at DESC");
  return NextResponse.json({ requests: rows });
}
