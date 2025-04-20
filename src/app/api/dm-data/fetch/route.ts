// src/app/api/dm-data/fetch/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId, otherUserId, targetDate } = await req.json();

    if (!userId || !otherUserId || !targetDate) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const [rows] = await db.query(
      `SELECT id, senderId, receiverId, message, created_at
       FROM dm_messages
       WHERE (
         (senderId = ? AND receiverId = ?) OR
         (senderId = ? AND receiverId = ?)
       )
       AND DATE(created_at) = ?`,
      [userId, otherUserId, otherUserId, userId, targetDate]
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("DM veri hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
