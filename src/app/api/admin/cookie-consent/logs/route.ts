// src/app/api/admin/cookie-consent/logs/route.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { getAuthUser } from "@/utils/getAuthUser";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET method allowed" });
  }

  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [rows] = await db.query(
      `
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
      `
    );

    return res.status(200).json({ logs: rows });
  } catch (error: any) {
    console.error("Cookie consent logs fetch error:", error);
    return res.status(500).json({
      message: "Error fetching cookie consent logs",
      error: error.message || "Unknown error",
    });
  }
}
