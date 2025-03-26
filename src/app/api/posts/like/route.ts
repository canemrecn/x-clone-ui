// src/app/api/posts/like/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket, OkPacket } from "mysql2/promise";

export async function POST(req: Request) {
  try {
    const { post_id } = await req.json();
    if (!post_id) {
      return NextResponse.json({ message: "post_id is required" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const user_id = decoded.id;

    // INSERT (OkPacket)
    const [insertResult] = await db.query<OkPacket>(
      "INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)",
      [post_id, user_id]
    );

    // SELECT (RowDataPacket[])
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT user_id FROM posts WHERE id = ?",
      [post_id]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    const postOwnerId = rows[0].user_id;

    // Post sahibine +0.01
    // ... Puan mantığı (benzer getLevel vs.)
    // ...

    return NextResponse.json({ message: "Post liked" }, { status: 201 });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ message: "Database error", error: String(error) }, { status: 500 });
  }
}
