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
