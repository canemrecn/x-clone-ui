// src/app/api/posts/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

/**
 * DELETE /api/posts/delete?postId=123
 * Authorization: Bearer <token>
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authorization header kontrolü
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Token değeri trim edilerek temizleniyor
    const token = authHeader.split(" ")[1].trim();
    
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    const decoded = jwt.verify(token, secret) as { id: number };
    const myId = decoded.id;

    // URL'den query parametreleri alınıyor
    const { searchParams } = new URL(request.url);
    const postIdParam = searchParams.get("postId");
    if (!postIdParam) {
      return NextResponse.json({ message: "postId is required" }, { status: 400 });
    }
    // postId, sayısal değere dönüştürülüp geçerliliği kontrol ediliyor
    const postId = Number(postIdParam.trim());
    if (isNaN(postId)) {
      return NextResponse.json({ message: "Invalid postId" }, { status: 400 });
    }

    // 1) DB'den post'u çekiyoruz.
    const [rows]: any = await db.query("SELECT user_id FROM posts WHERE id = ?", [postId]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // 2) Post sahibi kontrolü: Sadece post sahibi silinebilir.
    if (rows[0].user_id !== myId) {
      return NextResponse.json({ message: "Not your post" }, { status: 403 });
    }

    // 3) Post'u veritabanından silme işlemi
    await db.query("DELETE FROM posts WHERE id = ?", [postId]);

    return NextResponse.json({ message: "Post deleted" }, { status: 200 });
  } catch (err: any) {
    console.error("Delete post error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
