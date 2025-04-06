import jwt from "jsonwebtoken";

// Yeni Access Token almak için Refresh Token'ı doğrulama
export async function getRefreshToken(refreshToken: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");

  try {
    // Refresh token'ı doğrula
    const decoded = jwt.verify(refreshToken, secret) as { id: number };

    // Yeni bir access token oluştur
    const newAccessToken = jwt.sign({ id: decoded.id }, secret, { expiresIn: "1h" });
    return newAccessToken;
  } catch (err) {
    console.error("❌ Error refreshing token:", err);
    return null;
  }
}
