import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const secret = process.env.JWT_SECRET;

export async function POST(req: Request) {
  const { refreshToken } = await req.json();  // Refresh token'ı al

  if (!refreshToken) {
    return NextResponse.json({ message: "Refresh token is required" }, { status: 400 });
  }

  // JWT_SECRET kontrolü
  if (!secret) {
    throw new Error("JWT_SECRET not defined");
  }

  try {
    // Refresh token doğrulaması
    const decoded = jwt.verify(refreshToken, secret) as unknown;

    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
      const decodedToken = decoded as { id: number };

      // Yeni bir access token oluştur
      const newAccessToken = jwt.sign({ id: decodedToken.id }, secret, { expiresIn: '1h' });

      return NextResponse.json({ accessToken: newAccessToken }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Refresh token geçersiz veya süresi dolmuş.' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Refresh token geçersiz veya süresi dolmuş.' }, { status: 400 });
  }
}
