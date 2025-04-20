// src/app/api/admin/cookie-consent/logs/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/utils/getAuthUser";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [rows] = await db.query(`
    SELECT 
      c.id, 
      c.user_id,
      u.full_name, 
      u.username,
      c.consent_type, 
      c.analytics, 
      c.marketing, 
      c.ip_address, 
      c.user_agent, 
      c.created_at
    FROM cookie_consents c
    LEFT JOIN users u ON c.user_id = u.id
    ORDER BY c.created_at DESC
  `);
  

  return NextResponse.json({ logs: rows });
}
