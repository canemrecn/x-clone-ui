// src/app/api/posts/delete/[id]/route.ts
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, context: any) { // ✅ context tipi any yapıldı
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;
    const postId = Number(context?.params?.id);

    if (!token || isNaN(postId)) {
      return NextResponse.json({ message: "Geçersiz istek" }, { status: 400 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");

    const decoded = jwt.verify(token, secret) as { id: number; role: string };

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Yalnızca admin silebilir" }, { status: 403 });
    }

    await db.query(
      "UPDATE posts SET is_deleted = 1, deleted_at = NOW() WHERE id = ?",
      [postId]
    );

    return NextResponse.json({ message: "Gönderi silindi" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Sunucu hatası", error: err.message },
      { status: 500 }
    );
  }
}
