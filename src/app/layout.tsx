// src/app/layout.tsx
/*Bu dosya, Next.js uygulamasının tüm sayfalarını saran ana yerleşim bileşenidir (RootLayout) ve uygulamanın genel yapısını tanımlar; 
globals.css ile stilleri içe aktarır, kullanıcı kimliği doğrulaması için AuthProvider'ı uygular, sol menü (LeftBar), 
sağ menü (RightBar), masaüstü mesaj paneli (DesktopMessages), üst reklam (AdBar) ve sabit bir alt sol reklam (AdPlaceholder) 
gibi bileşenleri yerleştirir, ortadaki ana içerik alanında children ve varsa modal'i görüntüler, böylece tüm sayfalar için 
ortak bir düzen ve kullanıcı arayüzü sağlar.*/
// src/app/layout.tsx
/*Bu dosya, Next.js uygulamasının tüm sayfalarını saran ana yerleşim bileşenidir (RootLayout) ve uygulamanın genel yapısını tanımlar; 
globals.css ile stilleri içe aktarır, kullanıcı kimliği doğrulaması için AuthProvider'ı uygular, sol menü (LeftBar), 
sağ menü (RightBar), masaüstü mesaj paneli (DesktopMessages), üst reklam (AdBar) ve sabit bir alt sol reklam (AdPlaceholder) 
gibi bileşenleri yerleştirir, ortadaki ana içerik alanında children ve varsa modal'i görüntüler, böylece tüm sayfalar için 
ortak bir düzen ve kullanıcı arayüzü sağlar.*/

import React from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LeftBar from "@/components/LeftBar";
import RightBar from "@/components/RightBar";
import DesktopMessages from "@/components/DesktopMessages";
import AdBar from "@/components/Ad-Bar";
import AdPlaceholder from "@/components/AdPlaceholder";
import CookieBanner from "@/components/CookieBanner";

export const metadata = {
  title: "UnderGo",
  description: "Social media",
  icons: {
    icon: "/icons/logom2.png",
  },
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>UnderGo</title>
      </head>
      <body className="text-[#FFFFFF]">
        <AuthProvider>
          <AdBar />

          <div className="mb-4" />
          <LeftBar />

          {/* Sol alt reklam */}
          <div className="hidden lg:block fixed bottom-0 left-0 z-50">
            <AdPlaceholder width={260} height={300} />
          </div>

          <div className="min-h-screen flex">
            <aside className="hidden lg:block lg:w-80" />

            <main className="pt-10 pb-16 w-full lg:w-1/2 p-0">
              <CookieBanner />
              {children}
              {modal}
            </main>

            <aside className="hidden lg:block lg:w-1/4 mt-3 bg-[#000000]">
              <RightBar />
            </aside>
          </div>

          <DesktopMessages />
        </AuthProvider>
      </body>
    </html>
  );
}
