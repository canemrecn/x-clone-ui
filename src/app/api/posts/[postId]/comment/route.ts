// src/app/api/posts/[postId]/comment/route.ts
//Bu dosya, belirli bir gönderiye (postId) ait yorumları yönetmek için kullanılan bir API endpoint'idir. GET metodu, 
//ilgili gönderinin tüm yorumlarını kullanıcı bilgileriyle birlikte getirirken; POST metodu, doğrulanmış bir 
//kullanıcının gönderiye yeni yorum eklemesini sağlar. Ayrıca, isteğe bağlı olarak başka bir yoruma yanıt (reply) 
//olarak yorum yapılabilir. Yeni yorum eklendiğinde, gönderi sahibine 1 puan verilir ve bir yorum bildirimi oluşturulur.
//Bu dosya, belirli bir gönderiye (postId) ait yorumları yönetmek için kullanılan bir API endpoint'idir. GET metodu, 
//ilgili gönderinin tüm yorumlarını kullanıcı bilgileriyle birlikte getirirken; POST metodu, doğrulanmış bir 
//kullanıcının gönderiye yeni yorum eklemesini sağlar. Ayrıca, isteğe bağlı olarak başka bir yoruma yanıt (reply) 
//olarak yorum yapılabilir. Yeni yorum eklendiğinde, gönderi sahibine 1 puan verilir ve bir yorum bildirimi oluşturulur.
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { updateUserPoints } from "@/utils/points";
import { RowDataPacket, OkPacket } from "mysql2/promise";

// Yasaklı kelimeler listesi
const spamWords = ["salak", "aptal", "bok", "nefret", "iğrenç", "öldür"];

export async function GET(request: Request, context: { params: { postId: string } }) {
  try {
    const { postId } = await context.params; 
    const numericPostId = parseInt(postId, 10);
    if (isNaN(numericPostId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

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
    return NextResponse.json({ message: "Server error", error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: { postId: string } }) {
  try {
    const { postId } = await context.params;
    const numericPostId = parseInt(postId, 10);
    if (isNaN(numericPostId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const body = await request.json();
    const { text, parent_comment_id } = body;

    const cookieToken = request.headers.get("cookie") || "";
    const tokenMatch = cookieToken.match(/token=([^;]+)/);
    const token = tokenMatch?.[1];

    if (!token || !text) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    let sql = "INSERT INTO comments (post_id, user_id, text";
    const values: any[] = [numericPostId, userId, text];
    if (parent_comment_id !== undefined && parent_comment_id !== null) {
      const numericParentId = Number(parent_comment_id);
      if (isNaN(numericParentId)) {
        return NextResponse.json({ message: "Invalid parent_comment_id" }, { status: 400 });
      }
      sql += ", parent_comment_id";
      values.push(numericParentId);
    }
    sql += ") VALUES (?, ?, ?" + (parent_comment_id !== undefined && parent_comment_id !== null ? ", ?" : "") + ")";
    
    const [insertResult] = await db.query<OkPacket>(sql, values);

    // Gönderi sahibine puan ekle ve bildirim oluştur
    const [postRows] = await db.query<RowDataPacket[]>(`SELECT user_id FROM posts WHERE id = ?`, [numericPostId]);
    if (!postRows || postRows.length === 0) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    const postOwnerId = postRows[0].user_id;
    
    await db.query(
      `INSERT INTO notifications (user_id, type, from_user_id, post_id)
       VALUES (?, 'comment', ?, ?)`,
      [postOwnerId, userId, numericPostId]
    );

    // AI uyarısı
    const textLower = text.toLowerCase();
    const matched = spamWords.find((word) => textLower.includes(word));
    if (matched) {
      await db.query(`INSERT INTO user_warnings (user_id, reason, triggered_by, severity, post_id)
        VALUES (?, ?, 'ai', 'medium', ?)`, [userId, `Yorumda uygunsuz içerik bulundu: '${matched}'`, numericPostId]);
      console.log(`⚠️ AI uyarısı (yorum): Kullanıcı ID ${userId}`);
    }

    // Eklenen yorumu geri döndür
    const [commentRows] = await db.query<RowDataPacket[]>(`
      SELECT
         c.id, c.post_id, c.user_id, c.text, c.created_at, c.likes, 
         c.parent_comment_id, u.username, u.profile_image
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`, [(insertResult as OkPacket).insertId]);

    return NextResponse.json(
      { message: "Comment added", comment: commentRows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Comment POST error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
