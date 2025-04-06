//src/utils/auth.ts
// src/utils/auth.ts
import jwt from 'jsonwebtoken';

// Kullanıcıyı JWT token'ı üzerinden doğrulayan fonksiyon
export const getUserFromToken = (token: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    // Token'ı doğrulama ve kullanıcı bilgilerini çözümleme
    const decoded = jwt.verify(token, secret) as { id: number };
    return { id: decoded.id }; // Kullanıcı ID'sini döndür
  } catch (err) {
    console.error('Token doğrulama hatası:', err);
    return null; // Token geçersizse null döndür
  }
};
