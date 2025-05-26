//src/app/api/admin/reported-posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Token eksik" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET tanımsız");

    const decoded = jwt.verify(token, secret) as { id: number; role: string };

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 403 });
    }

    // ✅ URL'den ID çek
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const reportId = Number(segments[segments.length - 1]);

    if (isNaN(reportId)) {
      return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });
    }

    await db.query("DELETE FROM reports WHERE id = ?", [reportId]);

    return NextResponse.json({ message: "Şikayet silindi" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/admin/reported-posts/[id] error:", err);
    return NextResponse.json(
      { message: "Sunucu hatası", error: err.message },
      { status: 500 }
    );
  }
}
