// src/app/api/posts/approve/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number; role: string };
    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { postId } = await request.json();
    if (!postId) {
      return NextResponse.json({ message: "postId is required" }, { status: 400 });
    }

    // Pending post'u normal posts tablosuna taşı
    const [pending] = await db.query<any[]>("SELECT * FROM pending_posts WHERE id = ?", [postId]);
    const post = pending[0];

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    await db.query(
      `INSERT INTO posts (user_id, category_id, title, content, media_url, media_type, is_reel, lang)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        post.user_id,
        1, // Default kategori
        "Gönderiyi Göster",
        post.content,
        post.media_url,
        post.media_type,
        post.is_reel,
        post.lang || "tr",
      ]
    );

    await db.query("DELETE FROM pending_posts WHERE id = ?", [postId]);

    return NextResponse.json({ message: "Post approved and published." }, { status: 200 });
  } catch (error: any) {
    console.error("Post approve error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
