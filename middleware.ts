// /middleware.ts
/*Bu dosya, Next.js uygulamasında kullanıcıların kimlik doğrulamasını kontrol eden bir middleware 
tanımlar; gelen her istekte token adlı çerezi kontrol eder, eğer kullanıcı giriş yapmamışsa ve istek 
/register veya /login dışındaki bir sayfaya yönelmişse, kullanıcıyı otomatik olarak /register sayfasına 
yönlendirir; ayrıca sadece _next, favicon.ico, public ve api yolları dışındaki tüm yollar için geçerli 
olacak şekilde yapılandırılmıştır.*/
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const res = NextResponse.next();

  // ✅ Gelişmiş Güvenlik Başlıkları
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  // ✅ Content Security Policy
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://ik.imagekit.io; font-src 'self'; connect-src 'self';"
  );

  if (!token && req.nextUrl.pathname !== "/register" && req.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/register", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|public|api).*)"],
};
