// src/app/api/follows/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { areUsersBlocked } from "@/utils/blockHelpers";

export async function POST(req: Request) {
  try {
    const { following_id, action } = await req.json();
    if (!following_id || !action) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Authorization header kontrolü ve token temizliği
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    const decoded = jwt.verify(token, secret) as { id: number };
    const follower_id = decoded.id;

    // Blok kontrolü: Eğer iki kullanıcı arasında blok varsa, takip işlemi yapılamaz.
    const blocked = await areUsersBlocked(follower_id, following_id);
    if (blocked) {
      return NextResponse.json(
        { message: "Takip işlemi gerçekleştirilemez. Kullanıcı ile aranızda blok var." },
        { status: 403 }
      );
    }

    if (action === "follow") {
      // Mevcut takip ilişkisinin kontrolü: Zaten takip ediliyorsa yeniden ekleme yapılmaz.
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1",
        [follower_id, following_id]
      );
      if (rows.length > 0) {
        return NextResponse.json({ message: "Already following" }, { status: 200 });
      }
      // Takip ilişkisini ekleme
      await db.query(
        "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)",
        [follower_id, following_id]
      );
      // Bildirim ekleme: Takip bildirimi oluşturuluyor. (post_id NULL olarak gönderiliyor)
      await db.query(
        "INSERT INTO notifications (user_id, type, from_user_id, post_id) VALUES (?, ?, ?, ?)",
        [following_id, "follow", follower_id, null]
      );
      return NextResponse.json({ message: "Followed" }, { status: 200 });
    } else if (action === "unfollow") {
      // Takip ilişkisini kaldırma
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
