// src/app/api/auth/change-password/route.ts
// src/app/api/auth/change-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

export async function DELETE(req: Request) {
  try {
    // Authorization header kontrolü
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    // JWT token doğrulaması yapılarak kullanıcı ID'si elde ediliyor
    let decoded;
    try {
      decoded = jwt.verify(token, secret) as { id: number };
    } catch (err) {
      return NextResponse.json({ message: "Invalid or expired token." }, { status: 401 });
    }
    const userId = decoded.id;

    // İstek gövdesinden email ve şifre alınması
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    // Kullanıcı bilgilerini veritabanından çekme
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT email, password FROM users WHERE id = ?",
      [userId]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    const user = rows[0];

    // Email kontrolü: Girilen email ile veritabanındaki eşleşmeli
    if (user.email !== email) {
      return NextResponse.json({ message: "Email does not match." }, { status: 401 });
    }

    // Şifre kontrolü
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Password is incorrect." }, { status: 401 });
    }

    // Kullanıcı kaydının silinmesi (Prepared Statement kullanılarak)
    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    return NextResponse.json({ message: "Account deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ message: "Error deleting account." }, { status: 500 });
  }
}
