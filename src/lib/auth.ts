import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // sunucu tarafı için

// Yeni Access Token almak için Refresh Token'ı doğrulama
export async function getRefreshToken(refreshToken: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");

  try {
    const decoded = jwt.verify(refreshToken, secret) as { id: number };
    const newAccessToken = jwt.sign({ id: decoded.id }, secret, { expiresIn: "1h" });
    return newAccessToken;
  } catch (err) {
    console.error("❌ Error refreshing token:", err);
    return null;
  }
}

// HttpOnly cookie içinden kullanıcıyı al
export async function getUserFromCookies(): Promise<{ id: number } | null> {
  const cookieStore = cookies(); // Next.js 13+ headers API
  const token = (await cookieStore).get("token")?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;

  try {
    const decoded = jwt.verify(token, secret) as { id: number };
    return decoded;
  } catch (err) {
    console.error("JWT doğrulama hatası:", err);
    return null;
  }
}
