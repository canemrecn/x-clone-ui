// src/app/api/auth/delete-account/route.ts
//Bu dosya, kimliği doğrulanmış bir kullanıcının hesabını kalıcı olarak silmesini sağlayan 
//güvenli bir API endpoint’idir (/api/auth/delete-account, DELETE methodu); JWT token ile 
//kullanıcıyı doğrular, ardından kullanıcıdan e-posta ve şifresini ister, bu bilgileri 
//veritabanıyla karşılaştırır ve doğruysa kullanıcı kaydını siler. Hatalı veya eksik 
//bilgilerde detaylı uyarılar verir, başarılı işlemde onay mesajı döner, sistem hatalarında 
//ise 500 hata kodu ile geri döner.
// src/app/api/auth/delete-account/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { cookies } from "next/headers";

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

    // Kalıcı silme yerine soft delete + timestamp
    await db.query("UPDATE users SET is_deleted = 1, deleted_at = NOW() WHERE id = ?", [userId]);

    const response = NextResponse.json({ message: "Account marked as deleted." }, { status: 200 });
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
