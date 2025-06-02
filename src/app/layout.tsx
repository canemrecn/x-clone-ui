// src/app/layout.tsx
/*Bu dosya, Next.js uygulamasının tüm sayfalarını saran ana yerleşim bileşenidir (RootLayout) ve uygulamanın genel yapısını tanımlar; 
globals.css ile stilleri içe aktarır, kullanıcı kimliği doğrulaması için AuthProvider'ı uygular, sol menü (LeftBar), 
sağ menü (RightBar), masaüstü mesaj paneli (DesktopMessages), üst reklam (AdBar) ve sabit bir alt sol reklam (AdPlaceholder) 
gibi bileşenleri yerleştirir, ortadaki ana içerik alanında children ve varsa modal'i görüntüler, böylece tüm sayfalar için 
ortak bir düzen ve kullanıcı arayüzü sağlar. Ayrıca tüm sayfaya .anaglyph-effect sınıfı uygulanarak 3D gözlüklerle uyumlu hale getirilmiştir.*/
// src/app/layout.tsx
// src/app/layout.tsx

import React from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import CookieBanner from "@/components/CookieBanner";
import Analytics from "@/components/Analytics";

export const metadata = {
  title: "UnderGo",
  description: "UnderGo, dil öğrenimini sosyal medya deneyimiyle birleştiren bir platformdur.",
  icons: { icon: "/icons/logo22.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>UnderGo</title>

        {/* SVG tabanlı anaglyph filter */}
        <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
          <filter id="anaglyphFilter">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            />
          </filter>
        </svg>
      </head>

      {/* 👇 Tüm body'ye efekt uygulanıyor */}
      <body style={{ filter: "url(#anaglyphFilter)" }} className="text-[#FFFFFF]">
        <AuthProvider>
          <LayoutWrapper>
            <CookieBanner />
            {children}
            <Analytics />
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
