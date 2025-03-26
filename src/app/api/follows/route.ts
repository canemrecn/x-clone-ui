//src/app/api/follows/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function POST(req: Request) {
  try {
    const { following_id, action } = await req.json();
    if (!following_id || !action) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Token kontrol
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { id: number };
    const follower_id = decoded.id; // Takip eden kullanıcı

    if (action === "follow") {
      // Zaten takip ediyor mu?
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM follows WHERE follower_id=? AND following_id=?",
        [follower_id, following_id]
      );
      if (rows.length > 0) {
        return NextResponse.json({ message: "Already following" }, { status: 409 });
      }
      // Takip ekle
      await db.query(
        "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)",
        [follower_id, following_id]
      );

      // **BİLDİRİM EKLE**: Takip edilen kullanıcı = following_id
      // Bu bildirimi tetikleyen kullanıcı = follower_id
      await db.query(
        `INSERT INTO notifications (user_id, type, from_user_id) VALUES (?, 'follow', ?)`,
        [following_id, follower_id]
      );

      return NextResponse.json({ message: "Followed" }, { status: 200 });

    } else if (action === "unfollow") {
      // Takip sil
      await db.query(
        "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
        [follower_id, following_id]
      );
      return NextResponse.json({ message: "Unfollowed" }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Follows error:", error);
    return NextResponse.json({ message: "Server error", error: String(error) }, { status: 500 });
  }
}
