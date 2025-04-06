import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Zaten çıkış yapılmış." }, { status: 200 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not defined");

    let decoded;
    try {
      decoded = jwt.verify(token, secret) as { id: number };
    } catch {
      decoded = null;
    }

    // Token'ı sil
    const headers = new Headers();
    headers.append("Set-Cookie", "token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict");

    // ✅ Aktivite logla
    if (decoded?.id) {
      const ip = req.headers.get("x-forwarded-for") || "localhost";
      const userAgent = req.headers.get("user-agent") || "unknown";

      await db.query(
        "INSERT INTO activity_logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)",
        [decoded.id, "logout", ip, userAgent]
      );
    }

    return NextResponse.json({ message: "Çıkış başarılı" }, { status: 200, headers });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
