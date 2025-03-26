// src/app/api/posts/like.ts
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Yalnızca POST isteğine izin veriyoruz.
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { token: rawToken, post_id: rawPostId } = req.body;
  if (!rawToken || !rawPostId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Token ve post_id değerlerini temizleyip, token'i trim ediyor ve post_id'yi sayıya dönüştürüyoruz.
  const token = rawToken.toString().trim();
  const post_id = Number(rawPostId);
  if (isNaN(post_id)) {
    return res.status(400).json({ message: "Invalid post_id" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    // JWT token doğrulaması yapılıyor ve kullanıcı ID'si elde ediliyor.
    const decoded = jwt.verify(token, secret) as { id: number };
    const user_id = decoded.id;

    // Aynı kullanıcının aynı gönderiyi tekrar beğenmesini engellemek için INSERT IGNORE kullanıyoruz.
    await db.query(
      `INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)`,
      [post_id, user_id]
    );

    res.status(201).json({ message: "Post liked" });
  } catch (error: any) {
    console.error("Like error:", error);
    res.status(500).json({ message: "Database error", error: String(error) });
  }
}
