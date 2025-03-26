import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

export async function DELETE(req: Request) {
  try {
    // İstek başlığından token kontrolü (Kullanıcı oturumunda ise)
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    // Token doğrulaması yaparak kullanıcı id'sini alalım
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // İstek gövdesinden email ve şifreyi alalım
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    // Kullanıcının veritabanındaki bilgilerini çekelim
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT email, password FROM users WHERE id = ?",
      [userId]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    const user = rows[0];

    // Email kontrolü
    if (user.email !== email) {
      return NextResponse.json({ message: "Email does not match." }, { status: 401 });
    }

    // Şifre kontrolü
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Password is incorrect." }, { status: 401 });
    }

    // Hesabı sil (ilgili kullanıcı kaydını veritabanından kaldır)
    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    return NextResponse.json({ message: "Account deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ message: "Error deleting account." }, { status: 500 });
  }
}
