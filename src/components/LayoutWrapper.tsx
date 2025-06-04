"use client";

import { usePathname } from "next/navigation";
import AdBar from "@/components/Ad-Bar";
import LeftBar from "@/components/LeftBar";
import RightBar from "@/components/RightBar";
import DesktopMessages from "@/components/DesktopMessages";
import { useState, useEffect } from "react";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [enabled3D, setEnabled3D] = useState<boolean>(() => {
    // Sayfa açıldığında localStorage'dan varsayılanı oku
    if (typeof window !== "undefined") {
      return localStorage.getItem("enable3D") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (enabled3D) {
      document.body.classList.add("anaglyph");
      localStorage.setItem("enable3D", "true");
    } else {
      document.body.classList.remove("anaglyph");
      localStorage.setItem("enable3D", "false");
    }
  }, [enabled3D]);

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
      <LeftBar enabled3D={enabled3D} setEnabled3D={setEnabled3D} />
      <div className="min-h-screen flex">
        <aside className="hidden lg:block lg:w-80" />
        <main className="w-full lg:w-1/2">{children}</main>
        <aside className="hidden lg:block lg:w-1/1 mt-3 bg-[#000000]">
          <RightBar />
        </aside>
      </div>
      <DesktopMessages />
    </>
  );
}
