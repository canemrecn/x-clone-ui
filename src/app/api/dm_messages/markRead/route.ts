//src/app/api/dm_messages/markRead/route.ts
// src/app/api/dm_messages/markRead/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const secret = process.env.JWT_SECRET;
    if (!token || !secret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, secret) as { id: number };
    const myId = decoded.id;

    const body = await request.json();
    const { fromUserId } = body;

    if (!fromUserId) {
      return NextResponse.json({ message: "Missing fromUserId" }, { status: 400 });
    }

    await db.query(
      `UPDATE dm_messages SET isRead = 1 WHERE senderId = ? AND receiverId = ? AND isRead = 0`,
      [fromUserId, myId]
    );

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error: any) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
