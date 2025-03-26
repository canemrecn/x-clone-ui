//src/app/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Yalnızca POST isteğine izin veriyoruz
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Kullanıcıyı email'e göre sorguluyoruz
    const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    // Token oluşturuluyor (30 gün geçerli)
    const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: "30d" });

    // --- Cihaz bilgilerini ekleme işlemi ---
    // User-Agent bilgisini cihaz adı olarak kullanıyoruz.
    const deviceName = req.headers["user-agent"] || "Unknown Device";
    // IP adresini alma: reverse proxy veya doğrudan soket adresi kullanılabilir.
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP";
    const lastLogin = new Date();

    // Debug log: Cihaz bilgilerini kontrol etmek için (opsiyonel)
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
    res.status(500).json({ message: "Database error", error });
  }
}
