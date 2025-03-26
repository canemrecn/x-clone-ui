// src/app/api/posts/[postId]/comment/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { updateUserPoints } from "@/utils/points";
import { RowDataPacket, OkPacket } from "mysql2/promise";

interface Context {
  params: { postId: string };
}

/**
 * GET -> Belirli postId'ye ait tüm yorumları döndürür.
 * Yorumlar, ilgili kullanıcı bilgileri (username ve profile_image) ile birlikte çekilir.
 */
export async function GET(request: Request, context: Context) {
  try {
    // URL parametreleri alınır.
    const { postId } = context.params;
    if (!postId) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }
    const numericPostId = parseInt(postId.trim(), 10);
    if (isNaN(numericPostId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    // Yorumlar, ilgili kullanıcının bilgileriyle birlikte veritabanından çekilir.
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT
         c.id, c.post_id, c.user_id, c.text, c.created_at, c.likes, 
         c.parent_comment_id, u.username, u.profile_image
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [numericPostId]);

    return NextResponse.json({ comments: rows }, { status: 200 });
  } catch (error: any) {
    console.error("Comments GET error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST -> Yeni yorum ekler. Alt yorum (reply) eklemek için parent_comment_id desteği sağlar.
 * Ayrıca, gönderi sahibine 1 puan ekleyip, yorum bildirimi oluşturur.
 */
export async function POST(request: Request, context: Context) {
  try {
    // URL parametrelerinden postId alınır.
    const { postId } = context.params;
    if (!postId) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }
    const numericPostId = parseInt(postId.trim(), 10);
    if (isNaN(numericPostId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    // İstek gövdesinden token, yorum metni ve isteğe bağlı parent_comment_id alınır.
    const body = await request.json();
    const { token: rawToken, text: rawText, parent_comment_id } = body;
    if (!rawToken || !rawText) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }
    const token = rawToken.toString().trim();
    const text = rawText.toString().trim();
    if (!text) {
      return NextResponse.json({ message: "Comment text cannot be empty" }, { status: 400 });
    }

    // JWT doğrulaması: Token header'dan alınmadığı için body üzerinden alınıyor.
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not defined in .env");
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Dinamik SQL sorgusu oluşturuluyor: Eğer parent_comment_id varsa onu da ekliyoruz.
    let sql = "INSERT INTO comments (post_id, user_id, text";
    const vals: any[] = [numericPostId, userId, text];
    if (parent_comment_id !== undefined && parent_comment_id !== null) {
      // Eğer parent_comment_id sağlanmışsa, sayı olarak işleniyor.
      const numericParentId = Number(parent_comment_id);
      if (isNaN(numericParentId)) {
        return NextResponse.json({ message: "Invalid parent_comment_id" }, { status: 400 });
      }
      sql += ", parent_comment_id";
      vals.push(numericParentId);
    }
    sql += ") VALUES (?, ?, ?" + (parent_comment_id !== undefined && parent_comment_id !== null ? ", ?" : "") + ")";

    // Yorum ekleniyor.
    const [insertResult] = await db.query<OkPacket>(sql, vals);

    // Gönderi sahibini çekiyoruz.
    const [postRows] = await db.query<RowDataPacket[]>(
      "SELECT user_id FROM posts WHERE id = ?",
      [numericPostId]
    );
    if (!postRows || postRows.length === 0) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    const postOwnerId = postRows[0].user_id;

    // Gönderi sahibine 1 puan ekleniyor.
    await updateUserPoints(postOwnerId, 1);

    // Bildirim ekleme: Yorum bildirimi oluşturuluyor.
    await db.query(
      `INSERT INTO notifications (user_id, type, from_user_id, post_id)
       VALUES (?, 'comment', ?, ?)`,
      [postOwnerId, userId, numericPostId]
    );

    // Eklenen yorumu çekiyoruz.
    const [commentRows] = await db.query<RowDataPacket[]>(`
      SELECT
         c.id, c.post_id, c.user_id, c.text, c.created_at, c.likes, 
         c.parent_comment_id, u.username, u.profile_image
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [(insertResult as OkPacket).insertId]);

    return NextResponse.json(
      { message: "Comment added", comment: commentRows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Comment POST error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
