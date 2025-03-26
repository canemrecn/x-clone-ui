// src/app/api/posts/repost/route.ts
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

    // Orijinal postu bul (SELECT -> RowDataPacket[])
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT user_id, category_id, title, content, media_url, media_type FROM posts WHERE id = ?",
      [post_id]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    const original = rows[0];

    // Yeni satır ekle (INSERT -> OkPacket)
    const [insertResult] = await db.query<OkPacket>(
      `INSERT INTO posts (user_id, category_id, title, content, media_url, media_type, repost_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        original.category_id,
        original.title,
        original.content,
        original.media_url,
        original.media_type,
        post_id,
      ]
    );

    // Orijinal post sahibini bul
    const postOwnerId = original.user_id;

    // Post sahibinin points/level
    const [userRows] = await db.query<RowDataPacket[]>(
      "SELECT points, level FROM users WHERE id = ?",
      [postOwnerId]
    );
    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ message: "Post owner not found" }, { status: 404 });
    }

    let currentPoints = userRows[0].points;
    currentPoints += 0.05;

    function getLevel(points: number): string {
      if (points < 100) return "Beginner";
      if (points < 300) return "Intermediate";
      if (points < 500) return "Advanced";
      return "Legend";
    }
    const newLevel = getLevel(currentPoints);

    await db.query<OkPacket>(
      "UPDATE users SET points = ?, level = ? WHERE id = ?",
      [currentPoints, newLevel, postOwnerId]
    );

    return NextResponse.json({ message: "Reposted successfully" }, { status: 201 });
  } catch (error) {
    console.error("Repost error:", error);
    return NextResponse.json({ message: "Database error", error: String(error) }, { status: 500 });
  }
}
