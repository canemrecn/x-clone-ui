// /middleware.ts
/*Bu dosya, Next.js uygulamasında kullanıcıların kimlik doğrulamasını kontrol eden bir middleware 
tanımlar; gelen her istekte token adlı çerezi kontrol eder, eğer kullanıcı giriş yapmamışsa ve istek 
/register veya /login dışındaki bir sayfaya yönelmişse, kullanıcıyı otomatik olarak /register sayfasına 
yönlendirir; ayrıca sadece _next, favicon.ico, public ve api yolları dışındaki tüm yollar için geçerli 
olacak şekilde yapılandırılmıştır.*/
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

// 🌍 Edge Runtime Aktif
export const config = {
  runtime: "edge",
  matcher: ["/((?!_next|favicon.ico|public|api).*)"],
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

// 🌍 Türkiye dışı IP'leri engelle
const country = (req as any).geo?.country || "XX";
if (country !== "TR") {
  return NextResponse.redirect(new URL("/unavailable-in-your-region", req.url));
}


  const res = NextResponse.next();

  // 🔒 Güvenlik başlıkları
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://ik.imagekit.io; font-src 'self'; connect-src 'self';"
  );

  // 🔐 Admin sayfaları sadece admin erişimi
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/register", req.url));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role?: string };
      if (decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL("/register", req.url));
    }
  }

  // 🧾 Giriş yapılmamısşsa sadece register/login erişimi
  if (
    !token &&
    req.nextUrl.pathname !== "/register" &&
    req.nextUrl.pathname !== "/login"
  ) {
    return NextResponse.redirect(new URL("/register", req.url));
  }

  return res;
}
