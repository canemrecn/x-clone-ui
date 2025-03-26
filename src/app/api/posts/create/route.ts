// src/app/api/posts/create/route.ts

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, title, content, category_id, lang } = body;

    if (!token || !title || !content || !category_id) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, secret) as { id: number };
    const user_id = decoded.id;

    // 1) Gönderiyi veritabanına ekle
    await db.query(
      `INSERT INTO posts (user_id, category_id, title, content, lang)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, category_id, title, content, lang || "en"]
    );

    // 2) Kullanıcının puanını arttır (örneğin 10 puan)
    await db.query(
      `UPDATE users
       SET points = points + 1
       WHERE id = ?`,
      [user_id]
    );

    return NextResponse.json(
      { message: "Post created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("create/route.ts POST error:", error);
    return NextResponse.json(
      { message: "Database error", error: String(error) },
      { status: 500 }
    );
  }
}
