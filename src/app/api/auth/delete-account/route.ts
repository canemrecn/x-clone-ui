// src/app/api/auth/delete-account/route.ts
//Bu dosya, kimliği doğrulanmış bir kullanıcının hesabını kalıcı olarak silmesini sağlayan 
//güvenli bir API endpoint’idir (/api/auth/delete-account, DELETE methodu); JWT token ile 
//kullanıcıyı doğrular, ardından kullanıcıdan e-posta ve şifresini ister, bu bilgileri 
//veritabanıyla karşılaştırır ve doğruysa kullanıcı kaydını siler. Hatalı veya eksik 
//bilgilerde detaylı uyarılar verir, başarılı işlemde onay mesajı döner, sistem hatalarında 
//ise 500 hata kodu ile geri döner.
// ✅ src/app/api/auth/delete-account/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { cookies } from "next/headers";
import { deleteUserMediaFromImageKit } from "@/lib/imagekit";

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    const { email, password, reason } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT email, password FROM users WHERE id = ? AND is_deleted = 0",
      [userId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const user = rows[0];

    if (user.email !== email) {
      return NextResponse.json({ message: "Email does not match." }, { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Password is incorrect." }, { status: 401 });
    }

    // Silme günlüğü
    await db.query(
      "INSERT INTO deletion_logs (user_id, email, reason) VALUES (?, ?, ?)",
      [userId, user.email, reason || null]
    );

    // Medya dosyalarını ImageKit'ten sil
    await deleteUserMediaFromImageKit(userId);

    // Kullanıcıya ait tüm içerikleri zincirleme sil
    await db.query("DELETE FROM posts WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM comments WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM likes WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM follows WHERE follower_id = ? OR following_id = ?", [userId, userId]);
    await db.query("DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?", [userId, userId]);
    await db.query("DELETE FROM dm_messages WHERE senderId = ? OR receiverId = ?", [userId, userId]);
    await db.query("DELETE FROM read_words WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM notes WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM social_accounts WHERE userId = ?", [userId]);
    await db.query("DELETE FROM user_devices WHERE userId = ?", [userId]);
    await db.query("DELETE FROM notifications WHERE user_id = ? OR from_user_id = ?", [userId, userId]);
    await db.query("DELETE FROM user_warnings WHERE user_id = ?", [userId]);

    // En son kullanıcıyı da tamamen sil
    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    const response = NextResponse.json({ message: "Account and all data permanently deleted." }, { status: 200 });
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ message: "Error deleting account." }, { status: 500 });
  }
}