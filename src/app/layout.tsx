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
  description: "UnderGo, dil öğrenimini sosyal medya deneyimiyle birleştiren, KVKK ve GDPR uyumlu yenilikçi bir platformdur. Kullanıcılar, gönderi paylaşırken aynı zamanda yabancı dil pratiği yapabilir, kelime çevirileriyle puan kazanabilir ve dil seviyelerini geliştirebilir. Güvenli, etkileşimli ve kullanıcı odaklı bu sosyal medya uygulamasıyla öğrenmek artık çok daha eğlenceli! UnderGo ile sosyal medya artık sadece paylaşmak değil, aynı zamanda öğrenmektir.",
  icons: { icon: "/icons/logo22.png" },
  other: {
    "privacy-policy": "https://undergo.com/policies/privacy-policy",
    "cookie-policy": "https://undergo.com/cookies-policy",
    "data-protection": "UnderGo, dil öğrenimini sosyal medya deneyimiyle birleştiren, KVKK ve GDPR uyumlu yenilikçi bir platformdur. Kullanıcılar, gönderi paylaşırken aynı zamanda yabancı dil pratiği yapabilir, kelime çevirileriyle puan kazanabilir ve dil seviyelerini geliştirebilir. Güvenli, etkileşimli ve kullanıcı odaklı bu sosyal medya uygulamasıyla öğrenmek artık çok daha eğlenceli! UnderGo ile sosyal medya artık sadece paylaşmak değil, aynı zamanda öğrenmektir.",
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
            <CookieBanner />
            {children}           
            <Analytics />
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
