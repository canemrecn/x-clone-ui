// src/app/api/devices/route.ts
//Bu dosya, kullanıcıların cihaz bilgilerini yönetmesini sağlayan 
//bir API endpoint’idir (/api/devices) ve iki HTTP metodunu 
//destekler: GET isteğiyle JWT doğrulaması yapılan kullanıcının 
//daha önce giriş yaptığı cihazların bilgilerini (deviceName, 
 // ipAddress, lastLogin) veritabanından çekip sıralı olarak 
 // döner; POST isteğiyle ise doğrulanan kullanıcıdan gelen 
 // yeni cihaz bilgilerini alır ve user_devices tablosuna 
 // kaydeder. Her iki işlemde de yetkilendirme zorunludur 
 // ve eksik bilgi ya da sistem hatalarında uygun hata 
 // mesajları ve durum kodlarıyla yanıt verir.
// src/app/api/devices/route.ts
// src/app/api/devices/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

/**
 * GET: Kayıtlı cihazları döndürür
 * POST: Yeni cihaz bilgilerini ekler
 */

export async function GET(request: Request) {
  try {
    // Authorization header kontrolü
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Token değerini trim edip temizliyoruz
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    // JWT token doğrulaması
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Kullanıcının cihaz bilgilerini çekiyoruz (parametrik sorgu ile)
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

export async function POST(request: Request) {
  try {
    // Authorization header kontrolü
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    // Token'ı doğrulayarak kullanıcı ID'sini alıyoruz
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // İstek gövdesinden cihaz bilgilerini alıyoruz
    const { deviceName, ipAddress } = await request.json();
    if (!deviceName || !ipAddress) {
      return NextResponse.json({ message: "Device name and IP address are required." }, { status: 400 });
    }
    const lastLogin = new Date();

    // Cihaz bilgilerini veritabanına ekliyoruz
    await db.query(
      `INSERT INTO user_devices (userId, deviceName, ipAddress, lastLogin)
       VALUES (?, ?, ?, ?)`,
      [userId, deviceName, ipAddress, lastLogin]
    );

    return NextResponse.json({ message: "Cihaz başarıyla eklendi." }, { status: 201 });
  } catch (error) {
    console.error("Device add error:", error);
    return NextResponse.json({ message: "Cihaz eklenirken hata oluştu." }, { status: 500 });
  }
}
