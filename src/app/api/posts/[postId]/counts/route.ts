import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2/promise";

export async function GET(req: NextRequest, context: { params: { postId: string } }) {
  try {
    const postId = parseInt(context.params.postId, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    // Beğeni sayısını al
    const [[{ likeCount }]] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS likeCount FROM likes WHERE post_id = ?`,
      [postId]
    );

    // Yorum sayısını al
    const [[{ commentCount }]] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS commentCount FROM comments WHERE post_id = ? AND is_deleted = 0`,
      [postId]
    );

    // Kullanıcının beğenip beğenmediğini al
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    const token = tokenMatch?.[1];
    let isLiked = false;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
      const userId = decoded.id;

      const [[{ count }]] = await db.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS count FROM likes WHERE user_id = ? AND post_id = ?`,
        [userId, postId]
      );
      isLiked = count > 0;
    }

    return NextResponse.json({ likes: likeCount, comments: commentCount, isLiked });
  } catch (err: any) {
    console.error("Like/comment sayıları alınamadı:", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
