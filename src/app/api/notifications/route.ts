import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2/promise";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Kullanıcının bildirimlerini getir
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        n.*,
        u.username       AS from_username,
        u.profile_image  AS from_profile_image
      FROM notifications n
      LEFT JOIN users u ON n.from_user_id = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
    `, [userId]);

    return NextResponse.json({ notifications: rows }, { status: 200 });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// **📌 Yeni DELETE API Ekleniyor**
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: "Notification ID required" }, { status: 400 });
    }

    await db.query("DELETE FROM notifications WHERE id = ?", [id]);

    return NextResponse.json({ message: "Notification deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
