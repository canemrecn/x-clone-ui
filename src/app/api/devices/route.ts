// src/app/api/devices/route.ts
// src/app/api/devices/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// GET: Kayıtlı cihazları döndürür
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT id, deviceName, ipAddress, lastLogin
      FROM user_devices
      WHERE userId = ?
      ORDER BY lastLogin DESC
    `, [userId]);

    return NextResponse.json({ devices: rows }, { status: 200 });
  } catch (error) {
    console.error("Devices fetch error:", error);
    return NextResponse.json({ message: "Cihazlar alınırken hata oluştu." }, { status: 500 });
  }
}

// POST: Yeni cihaz bilgilerini ekler
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    // Token'ı doğrulayarak kullanıcı id'sini alıyoruz
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // İstek gövdesinden cihaz bilgilerini alıyoruz
    const { deviceName, ipAddress } = await request.json();
    const lastLogin = new Date();

    // Cihaz bilgilerini veritabanına ekliyoruz
    await db.query(
      `INSERT INTO user_devices (userId, deviceName, ipAddress, lastLogin)
       VALUES (?, ?, ?, ?)`,
      [userId, deviceName, ipAddress, lastLogin]
    );

    return NextResponse.json({ message: "Cihaz başarıyla eklendi." });
  } catch (error) {
    console.error("Device add error:", error);
    return NextResponse.json({ message: "Cihaz eklenirken hata oluştu." }, { status: 500 });
  }
}
