// src/app/layout.tsx
/*Bu dosya, Next.js uygulamasının tüm sayfalarını saran ana yerleşim bileşenidir (RootLayout) ve uygulamanın genel yapısını tanımlar; 
globals.css ile stilleri içe aktarır, kullanıcı kimliği doğrulaması için AuthProvider'ı uygular, sol menü (LeftBar), 
sağ menü (RightBar), masaüstü mesaj paneli (DesktopMessages), üst reklam (AdBar) ve sabit bir alt sol reklam (AdPlaceholder) 
gibi bileşenleri yerleştirir, ortadaki ana içerik alanında children ve varsa modal'i görüntüler, böylece tüm sayfalar için 
ortak bir düzen ve kullanıcı arayüzü sağlar.*/
import React from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import CookieBanner from "@/components/CookieBanner";
import Analytics from "@/components/Analytics";

export const metadata = {
  title: "UnderGo",
  description: "UnderGo KVKK ve GDPR uyumlu sosyal medya platformudur.",
  icons: { icon: "/icons/logom2.png" },
  other: {
    "privacy-policy": "https://undergo.com/policies/privacy-policy",
    "cookie-policy": "https://undergo.com/cookies-policy",
    "data-protection": "KVKK uyumlu veri işleme politikası uygulanmaktadır.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>UnderGo</title>
      </head>
      <body className="text-[#FFFFFF]">
        <AuthProvider>
          <LayoutWrapper>
            {children}
            <CookieBanner />
            <Analytics />
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
