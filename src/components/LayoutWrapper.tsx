"use client";

import { usePathname } from "next/navigation";
import AdBar from "@/components/Ad-Bar";
import LeftBar from "@/components/LeftBar";
import RightBar from "@/components/RightBar";
import DesktopMessages from "@/components/DesktopMessages";
import CookieBanner from "@/components/CookieBanner";
import ThreeDOverlay from "@/components/ThreeDOverlay"; // 🔴 3D efekt katmanı

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Reels, DM ve Chat-AI sayfalarında özel tam ekran layout kullanılıyor
  if (
    pathname?.startsWith("/reels") ||
    pathname?.startsWith("/direct-messages") ||
    pathname?.startsWith("/chat-ai")
  ) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="mb-4" />

      {/* 🔵 Sol Menü */}
      <LeftBar />

      {/* 🔵 Ana Sayfa Yapısı */}
      <div className="min-h-screen flex anaglyph-effect"> {/* 🎯 3D efekti burada aktive ettik */}
        <aside className="hidden lg:block lg:w-80 not-3d" />
        <main className="w-full lg:w-1/2 not-3d">
          {children}
        </main>
        <aside className="hidden lg:block lg:w-1/1 mt-3 bg-[#000000] not-3d">
          <RightBar />
        </aside>
      </div>

      {/* 🔵 Footer Bileşenleri */}
      <DesktopMessages />
      <CookieBanner />

      {/* 🔴 3D Overlay Katmanı */}
      <ThreeDOverlay />
    </>
  );
}
