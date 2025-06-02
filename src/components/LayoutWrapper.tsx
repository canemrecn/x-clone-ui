//src/components/LayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import AdBar from "@/components/Ad-Bar";
import LeftBar from "@/components/LeftBar";
import RightBar from "@/components/RightBar";
import DesktopMessages from "@/components/DesktopMessages";
import CookieBanner from "@/components/CookieBanner";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/reels") || pathname?.startsWith("/direct-messages") || pathname?.startsWith("/chat-ai")) {
    return <>{children}</>;
  }

  return (
    <>

      <div className="mb-4" />
      <LeftBar />
      <div className="min-h-screen flex">
        <aside className="hidden lg:block lg:w-80" />
        <main className="w-full lg:w-1/2">
 
          {children}
        </main>
        <aside className="hidden lg:block lg:w-1/1 mt-3 bg-[#000000]">
          <RightBar />
        </aside>
      </div>
      <DesktopMessages />
    </>
  );
}
