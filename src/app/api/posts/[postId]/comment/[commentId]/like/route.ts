// src/app/api/posts/[postId]/comment/[commentId]/like/route.ts
//Bu dosya, belirli bir gönderiye ait belirli bir yorumun beğeni (like) sayısını artırmak için kullanılan bir API 
//endpoint'idir (/api/posts/[postId]/comment/[commentId]/like). JWT ile doğrulanan kullanıcıdan alınan token 
//sayesinde kullanıcı kimliği doğrulanır, ardından commentId ile ilişkili yorumun likes sütunu 1 artırılır ve 
//güncellenmiş beğeni sayısı döndürülür. Hatalı commentId, geçersiz token veya veritabanı hataları uygun HTTP 
//kodlarıyla ele alınır.
// src/app/api/posts/[postId]/comment/[commentId]/like/route.ts
//Bu dosya, belirli bir gönderiye ait belirli bir yorumun beğeni sayısını artırmak için kullanılır.
//JWT, yalnızca HttpOnly cookie üzerinden alınır. Token body'den alınmaz.
// src/app/api/posts/[postId]/comment/[commentId]/like/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket, OkPacket } from "mysql2/promise";

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

    // Authorization header'dan token alıyoruz
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined in environment variables");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

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
