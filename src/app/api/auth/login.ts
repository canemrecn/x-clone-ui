// src/app/api/auth/login.ts
// src/app/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Basit email kontrolü için regex (temel düzeyde)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Token süresi (30 gün)
const TOKEN_EXPIRATION = "30d";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Yalnızca POST isteğine izin veriyoruz
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Giriş verilerini temizleyerek alıyoruz
  let { email, password } = req.body;
  email = typeof email === "string" ? email.trim() : "";
  password = typeof password === "string" ? password.trim() : "";

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  // Email format kontrolü
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    // Kullanıcıyı email'e göre sorguluyoruz (hazırlanmış sorgu)
    const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // Şifre doğrulama
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Email doğrulama kontrolü
    if (!user.is_verified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    // JWT_SECRET kontrolü
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    // Token oluşturuluyor (30 gün geçerli)
    const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: TOKEN_EXPIRATION });

    // --- Cihaz bilgilerini ekleme işlemi ---
    // Kullanıcı-Agent bilgisini cihaz adı olarak kullanıyoruz.
    const deviceName = req.headers["user-agent"]?.toString() || "Unknown Device";
    // IP adresini alma: reverse proxy veya doğrudan soket adresi kullanılabilir.
    const ipAddress = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP").toString();
    const lastLogin = new Date();

    // Cihaz bilgilerini loglamak (opsiyonel)
    console.log("Login Device Info:", { userId: user.id, deviceName, ipAddress, lastLogin });

    // Kullanıcının cihaz bilgilerini user_devices tablosuna ekliyoruz.
    await db.query(
      `INSERT INTO user_devices (userId, deviceName, ipAddress, lastLogin)
       VALUES (?, ?, ?, ?)`,
      [user.id, deviceName, ipAddress, lastLogin]
    );
    // --- /Cihaz bilgilerini ekleme işlemi ---

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Database error", error: String(error) });
  }
}
