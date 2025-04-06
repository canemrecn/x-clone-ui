// src/app/api/auth/logout.ts
//Bu dosya, kullanıcının oturumunu sonlandırmak için kullanılan bir API 
//endpoint’idir (/api/auth/logout); istemcide saklanan token isimli JWT 
//çerezini geçersiz hale getirerek (boş değer, HttpOnly, Max-Age=0) siler 
//ve oturumun kapatıldığını belirten "Logged out" mesajıyla birlikte 200 
//durum kodu döner.
// src/app/api/auth/logout.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Çıkış işlemi için çerezi geçersiz kılalım (HttpOnly cookie)
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    "token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict"
  );

  return NextResponse.json({ message: "Logged out" }, { status: 200, headers });
}