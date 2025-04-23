// src/app/api/users/[id]/route.ts
/*Bu dosya, belirli bir kullanıcı ID’sine sahip kullanıcının bilgilerini veritabanından çekip döndüren bir API endpoint’idir. GET metodu 
kullanılarak çalışır; URL parametresinden gelen id değeri önce doğrulanır ve sayıya dönüştürülür. Ardından bu ID ile users tablosunda 
sorgu yapılır. Eğer kullanıcı bulunursa id ve username bilgileri döndürülür, bulunamazsa 404 hatası verilir. Hatalar durumunda 500 döner 
ve hata mesajı loglanır.*/
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import jwt from "jsonwebtoken";

/**
 * GET: Kullanıcı bilgilerini döndürür.
 */
export async function GET(req: Request, context: any) { // ✅ context tipini any yaptık
  try {
    const userIdRaw = context?.params?.id;

    if (!userIdRaw || typeof userIdRaw !== "string") {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const userId = parseInt(userIdRaw.trim(), 10);
    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err: unknown) {
      const error = err as Error;
      return NextResponse.json({ message: "Invalid token", error: error.message }, { status: 401 });
    }

    const currentUserId = decoded.id;

    if (userId !== currentUserId) {
      return NextResponse.json({ message: "You are not authorized to view this user." }, { status: 403 });
    }

    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT id, username FROM users WHERE id = ?`,
      [userId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Error fetching user", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
