// src/app/api/posts/create.ts

import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });

  const { token, title, content, category_id, lang } = req.body;

  // 1) BURAYA EKLEYİN
  console.log("create.ts - received lang:", lang);

  if (!token || !title || !content || !category_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    const decoded = jwt.verify(token, secret) as { id: number };
    const user_id = decoded.id;

    // 2) EK BİLGİ LOG
    console.log("create.ts - inserting post:", {
      user_id,
      category_id,
      title,
      content,
      lang: lang || "en",
    });

    await db.query(
      `INSERT INTO posts (user_id, category_id, title, content, lang)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, category_id, title, content, lang || "en"]
    );

    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Database error", error });
  }
}
