//src/app/api/posts/[postId]/comment/[commentId]/like/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import type { RowDataPacket, OkPacket } from "mysql2/promise";

/** 
 * RowDataPacket ile kendi alanınızı birleştiriyoruz.
 * Böylece "updatedLikes" alanına ek olarak 
 * RowDataPacket tipinin özelliklerini de taşır.
 */
interface LikeRow extends RowDataPacket {
  updatedLikes: number;
}

interface ContextParams {
  postId: string;
  commentId: string;
}

// Yöntem 2: asenkron param
interface Context {
  params: Promise<ContextParams>;
}

export async function POST(request: Request, context: Context) {
  try {
    const { postId, commentId } = await context.params;
    const numericCommentId = parseInt(commentId, 10);

    const body = await request.json() as { token?: string };
    if (!body.token) {
      return NextResponse.json({ message: "No token" }, { status: 401 });
    }

    // JWT_SECRET undefined ise hata verelim (TS'te string olduğundan emin olmak için)
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(body.token, secret) as { id: number };
    const userId = decoded.id; 
    // isterseniz userId'yi toggle logic için kullanabilirsiniz

    // comments tablosundaki "likes" sütununu 1 arttır
    await db.query<OkPacket>(
      "UPDATE comments SET likes = likes + 1 WHERE id = ?",
      [numericCommentId]
    );

    // Yeni beğeni sayısını çek - LikeRow tipini kullanıyoruz
    const [likeRows] = await db.query<LikeRow[]>(
      "SELECT likes AS updatedLikes FROM comments WHERE id = ?",
      [numericCommentId]
    );

    if (likeRows.length === 0) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Comment liked",
      newLikes: likeRows[0].updatedLikes,
    });
  } catch (error) {
    console.error("Comment like error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
