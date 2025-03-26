import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { updateUserPoints } from "@/utils/points";
import { RowDataPacket, OkPacket } from "mysql2/promise";

interface Context {
  params: { postId: string };
}

// GET -> Belirli postId'ye ait tüm yorumları döndürür
export async function GET(request: Request, context: Context) {
  try {
    const params = await context.params; // `params` asenkron olarak çözülmeli
    const postId = params.postId; // Burada artık kullanılabilir

    if (!postId) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }
    const numericPostId = parseInt(postId, 10);

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
         c.id, c.post_id, c.user_id, c.text, c.created_at, c.likes, 
         c.parent_comment_id, u.username, u.profile_image
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [numericPostId]
    );

    return NextResponse.json({ comments: rows }, { status: 200 });
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}

// POST -> Yeni yorum ekler (alt yorum için parent_comment_id desteği)
export async function POST(request: Request, context: Context) {
  try {
    const params = await context.params; // `params` asenkron olarak çözülmeli
    const postId = params.postId; // Burada artık kullanılabilir

    if (!postId) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }
    const numericPostId = parseInt(postId, 10);

    const body = await request.json();
    const { token, text, parent_comment_id } = body;

    if (!token || !text) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Token doğrula
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    let sql = "INSERT INTO comments (post_id, user_id, text";
    let vals = [numericPostId, userId, text];

    if (parent_comment_id) {
      sql += ", parent_comment_id";
      vals.push(parent_comment_id);
    }
    sql += ") VALUES (?, ?, ?" + (parent_comment_id ? ", ?" : "") + ")";

    const [insertResult] = await db.query<OkPacket>(sql, vals);

    // Gönderi sahibine 1 puan ekle
    const [postRows] = await db.query<RowDataPacket[]>(
      "SELECT user_id FROM posts WHERE id = ?",
      [numericPostId]
    );
    if (!postRows || postRows.length === 0) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    const postOwnerId = postRows[0].user_id;
    await updateUserPoints(postOwnerId, 1);

    // **BİLDİRİM EKLE**
    await db.query(
      `INSERT INTO notifications (user_id, type, from_user_id, post_id)
       VALUES (?, 'comment', ?, ?)`,
      [postOwnerId, userId, numericPostId]
    );

    // Eklenen yorumu çekip yanıt olarak döndür
    const [commentRows] = await db.query<RowDataPacket[]>(
      `SELECT
         c.id, c.post_id, c.user_id, c.text, c.created_at, c.likes, 
         c.parent_comment_id, u.username, u.profile_image
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [(insertResult as OkPacket).insertId]
    );

    return NextResponse.json(
      { message: "Comment added", comment: commentRows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Comment POST error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
