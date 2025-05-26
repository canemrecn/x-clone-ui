//src/app/api/admin/reported-posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;
    const reportId = Number(context.params.id);

    if (!token || isNaN(reportId)) {
      return NextResponse.json({ message: "Geçersiz istek" }, { status: 400 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET tanımlı değil");

    const decoded = jwt.verify(token, secret) as { id: number; role: string };

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Yalnızca admin işlemi yapabilir" }, { status: 403 });
    }

    await db.query("DELETE FROM reports WHERE id = ?", [reportId]);

    return NextResponse.json({ message: "Şikayet kaldırıldı" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/admin/reported-posts/[id] error:", err);
    return NextResponse.json(
      { message: "Sunucu hatası", error: err.message },
      { status: 500 }
    );
  }
}
