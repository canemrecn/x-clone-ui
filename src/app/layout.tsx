// src/app/layout.tsx (veya RootLayout)
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LeftBar from "@/components/LeftBar";
import RightBar from "@/components/RightBar";
import React from "react";
import DesktopMessages from "@/components/DesktopMessages";
import AdBar from "@/components/Ad-Bar";
import AdPlaceholder from "@/components/AdPlaceholder";

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
      <body className="text-[#FFFFFF]">
        <AuthProvider>
          <AdBar />

          <div className="mb-4" />

          <LeftBar />

          {/* SOLDaki REKLAM: LeftBar altına sabit */}
          <div className="hidden lg:block fixed bottom-0 left-0 z-50">
            {/* Burada istediğiniz width/height veriyorsunuz */}
            <AdPlaceholder width={260} height={300} />
          </div>

          <div className="min-h-screen flex">
            <aside className="hidden lg:block lg:w-80 "></aside>

            <main className="pt-10 pb-16 w-full lg:w-1/2 p-0">
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
