// src/app/api/posts/[postId]/comment/[commentId]/like/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import type { RowDataPacket, OkPacket } from "mysql2/promise";

/**
 * LikeRow: "updatedLikes" alanını içerir.
 * Bu tip, sorgudan gelen güncellenmiş beğeni sayısını temsil eder.
 */
interface LikeRow extends RowDataPacket {
  updatedLikes: number;
}

interface ContextParams {
  postId: string;
  commentId: string;
}

// Context, asenkron parametreleri içerir.
interface Context {
  params: Promise<ContextParams>;
}

export async function POST(request: Request, context: Context) {
  try {
    // URL parametrelerini alıyoruz.
    const { postId, commentId } = await context.params;
    const numericCommentId = parseInt(commentId, 10);
    if (isNaN(numericCommentId)) {
      return NextResponse.json({ message: "Invalid commentId" }, { status: 400 });
    }

    // İstek gövdesinden token bilgisini alıyoruz.
    const { token: rawToken } = await request.json() as { token?: string };
    if (!rawToken) {
      return NextResponse.json({ message: "No token" }, { status: 401 });
    }
    const token = rawToken.trim();

    // JWT doğrulaması için gerekli secret
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined in environment variables");
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;
    // userId, toggle veya kullanıcıya özel beğeni işlemleri için kullanılabilir.

    // Yorumun "likes" sütununu 1 arttırıyoruz.
    await db.query<OkPacket>(
      "UPDATE comments SET likes = likes + 1 WHERE id = ?",
      [numericCommentId]
    );

    // Güncellenmiş beğeni sayısını çekiyoruz.
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
  } catch (error: any) {
    console.error("Comment like error:", error);
    return NextResponse.json({ message: "Server error", error: error.message || "Unknown error" }, { status: 500 });
  }
}
