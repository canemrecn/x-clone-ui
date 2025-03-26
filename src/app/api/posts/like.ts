//src/app/api/posts/like.ts
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

    const { token, post_id } = req.body;
    if (!token || !post_id) return res.status(400).json({ message: "All fields are required" });

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in the environment variables");
        }

        const decoded = jwt.verify(token, secret) as { id: number };  // 👈 user_id'yi çekiyoruz
        const user_id = decoded.id; // 👈 user_id artık mevcut

        await db.query(`
            INSERT INTO likes (post_id, user_id) VALUES (?, ?)
        `, [post_id, user_id]);

        res.status(201).json({ message: "Post liked" });
    } catch (error) {
        res.status(500).json({ message: "Database error", error });
    }
}
