// src/app/api/posts/[postId]/comment/[commentId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ✅ Type'ı RequestContext olarak belirt
interface RequestContext {
  params: {
    postId: string;
    commentId: string;
  };
}

export async function DELETE(
  req: NextRequest,
  context: RequestContext
) {
  const { postId, commentId } = context.params;

  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Token bulunamadı." }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userId = decoded.id;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM comments WHERE id = ? AND post_id = ? AND is_deleted = 0`,
      [commentId, postId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Yorum bulunamadı." }, { status: 404 });
    }

    const comment = rows[0];

    if (comment.user_id !== userId) {
      return NextResponse.json({ message: "Bu yorumu silmeye yetkiniz yok." }, { status: 403 });
    }

    await db.query(`UPDATE comments SET is_deleted = 1 WHERE id = ?`, [commentId]);

    return NextResponse.json({ message: "Yorum başarıyla silindi." }, { status: 200 });

  } catch (error) {
    console.error("Silme hatası:", error);
    return NextResponse.json({ message: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
