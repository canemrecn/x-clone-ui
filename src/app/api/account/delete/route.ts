//src/app/api/account/delete/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST() {
  try {
    // 1. Token kontrolü (HTTP-only cookie)
    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number; email: string };
    const userId = decoded.id;
    const email = decoded.email;

    // 2. Kullanıcıyı fiziksel olarak silmek yerine soft-delete uygula
    await db.query("UPDATE users SET is_deleted = true, deleted_at = NOW() WHERE id = ?", [userId]);

    // 3. Gönderiler, yorumlar, takipler soft-delete
    await db.query("UPDATE posts SET is_deleted = true, deleted_at = NOW() WHERE user_id = ?", [userId]);
    await db.query("UPDATE comments SET is_deleted = true, deleted_at = NOW() WHERE user_id = ?", [userId]);
    await db.query("UPDATE follows SET is_deleted = true, deleted_at = NOW() WHERE follower_id = ? OR following_id = ?", [userId, userId]);

    // 4. DM mesajları: silinmesin, arşivlensin
    await db.query("UPDATE dm_messages SET is_archived = true WHERE senderId = ? OR receiverId = ?", [userId, userId]);

    // 5. Social accounts soft-delete (ya da isterseniz hard-delete edilebilir)
    await db.query("DELETE FROM social_accounts WHERE userId = ?", [userId]);

    // 6. Log kaydı oluştur (yasal durumlar için)
    await db.query(
      "INSERT INTO deletion_logs (user_id, email, reason) VALUES (?, ?, ?)",
      [userId, email, "Kullanıcı kendi isteğiyle hesabını sildi."]
    );

    // 7. Cookie’yi sil
    const headers = new Headers();
    headers.append("Set-Cookie", "token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict");

    return NextResponse.json({ message: "Hesap başarıyla silindi." }, { status: 200, headers });
  } catch (error) {
    console.error("Hesap silme hatası:", error);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
