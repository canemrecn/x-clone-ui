// src/app/api/posts/[postId]/like/route.ts
//Bu dosya, bir gönderinin beğenilmesini sağlayan API endpoint’idir. Doğrulanmış kullanıcıdan alınan JWT token 
//ile kimlik doğrulaması yapılır, ardından kullanıcının ilgili gönderiyi daha önce beğenip beğenmediği kontrol 
//edilerek, eğer ilk kez beğeniyorsa likes tablosuna kayıt eklenir. Gönderinin sahibi veritabanından çekilerek 
//ona 1 puan kazandırılır ve beğeniye dair bir bildirim oluşturularak notifications tablosuna kaydedilir. 
//Böylece hem beğeni işlemi yapılır, hem puan sistemi işler, hem de kullanıcı bilgilendirilmiş olur.
// src/app/api/posts/[postId]/like/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2/promise";
import { updateUserPoints } from "@/utils/points";

export async function POST(request: Request) {
  try {
    // URL'den postId'yi manuel çıkar
    const url = new URL(request.url);
    const pathname = url.pathname; // örnek: /api/posts/7/like
    const parts = pathname.split("/");
    const postId = parts[3]; // 0:/, 1:api, 2:posts, 3:postId, 4:like
    const numericPostId = parseInt(postId, 10);

    if (!postId || isNaN(numericPostId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    // Token'ı cookie'den al
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    const token = tokenMatch?.[1];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Like varsa kaldır, yoksa ekle (toggle mantığı)
    const [existing] = await db.query<RowDataPacket[]>(
      "SELECT * FROM likes WHERE user_id = ? AND post_id = ?",
      [userId, numericPostId]
    );

    if (existing.length > 0) {
      await db.query("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [
        userId,
        numericPostId,
      ]);
    } else {
      await db.query("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [
        numericPostId,
        userId,
      ]);

      const [postRows] = await db.query<RowDataPacket[]>(
        "SELECT user_id FROM posts WHERE id = ?",
        [numericPostId]
      );
      if (!postRows || postRows.length === 0) {
        return NextResponse.json({ message: "Post not found" }, { status: 404 });
      }
      const postOwnerId = postRows[0].user_id;

      await updateUserPoints(postOwnerId, 1);
      await db.query(
        "INSERT INTO notifications (user_id, type, from_user_id, post_id) VALUES (?, 'like', ?, ?)",
        [postOwnerId, userId, numericPostId]
      );
    }

    const [countRows] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM likes WHERE post_id = ?",
      [numericPostId]
    );
    const totalLikes = countRows[0].total;

    return NextResponse.json({ message: "Like toggled", totalLikes }, { status: 200 });
  } catch (error: any) {
    console.error("Like error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
