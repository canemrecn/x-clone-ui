// /middleware.ts
/*Bu dosya, Next.js uygulamasında kullanıcıların kimlik doğrulamasını kontrol eden bir middleware 
tanımlar; gelen her istekte token adlı çerezi kontrol eder, eğer kullanıcı giriş yapmamışsa ve istek 
/register veya /login dışındaki bir sayfaya yönelmişse, kullanıcıyı otomatik olarak /register sayfasına 
yönlendirir; ayrıca sadece _next, favicon.ico, public ve api yolları dışındaki tüm yollar için geçerli 
olacak şekilde yapılandırılmıştır.*/
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value; // Kullanıcının giriş yapıp yapmadığını kontrol et

    if (!token && req.nextUrl.pathname !== "/register" && req.nextUrl.pathname !== "/login") {
        return NextResponse.redirect(new URL("/register", req.url)); // Eğer giriş yapılmadıysa, /register sayfasına yönlendir
    }

    return NextResponse.next();
}

// Middleware'in hangi yollar için çalışacağını belirle
export const config = {
    matcher: ["/((?!_next|favicon.ico|public|api).*)"], // API isteklerini ve statik dosyaları hariç tut
};
