// src/app/api/dm_messages/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import jwt from "jsonwebtoken";
import { areUsersBlocked } from "@/utils/blockHelpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const buddyIdParam = searchParams.get("buddyId");
    if (!buddyIdParam) {
      return NextResponse.json({ message: "buddyId param is required" }, { status: 400 });
    }

    // Convert buddyId to number and validate it
    const buddyId = Number(buddyIdParam.trim());
    if (!buddyId) {
      return NextResponse.json({ message: "Invalid buddyId" }, { status: 400 });
    }

    // Token kontrolü: Authorization header'dan token'ı al ve trim et
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Blok kontrolü: Eğer iki kullanıcı arasında blok varsa, mesajları döndürme.
    const blocked = await areUsersBlocked(userId, buddyId);
    if (blocked) {
      return NextResponse.json(
        { message: "Mesajlaşma işlemi gerçekleştirilemez. Kullanıcı ile aranızda blok var." },
        { status: 403 }
      );
    }

    // DM mesajları sorgusu: sender/receiver ikilisi üzerinden sorgu yapılıyor.
    const query = `
      SELECT * 
      FROM dm_messages
      WHERE 
        (senderId = ? AND receiverId = ?)
        OR (senderId = ? AND receiverId = ?)
      ORDER BY created_at ASC
    `;
    const [rows] = await db.query<RowDataPacket[]>(query, [userId, buddyId, buddyId, userId]);

    return NextResponse.json({ messages: rows }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching DM messages:", error);
    return NextResponse.json({ message: error.message || "Error fetching messages" }, { status: 500 });
  }
}
