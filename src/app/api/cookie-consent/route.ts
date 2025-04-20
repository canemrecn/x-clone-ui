// src/app/api/cookie-consent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/utils/getAuthUser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { consent_given } = body;

    const cookieStore = req.cookies;
    const analyticsConsent = cookieStore.get("analyticsConsent")?.value === "true";
    const marketingConsent = cookieStore.get("marketingConsent")?.value === "true";

    const user = await getAuthUser();

    const userAgent = req.headers.get("user-agent") || "Unknown";
    const ip = req.headers.get("x-forwarded-for") || "Unknown";

    await db.query(
      "INSERT INTO cookie_consents (user_id, consent_type, analytics, marketing, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)",
      [
        user?.id ?? null,
        consent_given ? "all" : "necessary",
        analyticsConsent,
        marketingConsent,
        ip,
        userAgent,
      ]
    );

    return NextResponse.json({ message: "Çerez onayı kaydedildi." });
  } catch (err) {
    console.error("Çerez onayı hatası:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
