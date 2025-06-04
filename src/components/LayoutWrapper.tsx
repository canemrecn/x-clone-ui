"use client";

import { usePathname } from "next/navigation";
import AdBar from "@/components/Ad-Bar";
import LeftBar from "@/components/LeftBar";
import RightBar from "@/components/RightBar";
import DesktopMessages from "@/components/DesktopMessages";
import { useState, useEffect, isValidElement, cloneElement } from "react";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [enabled3D, setEnabled3D] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("enable3D");
    if (stored === "true") {
      setEnabled3D(true);
      document.body.classList.add("anaglyph");
    }
  }, []);

  useEffect(() => {
  const stored = localStorage.getItem("enable3D");
  if (stored === "true") {
    setEnabled3D(true);
  }
}, []);

useEffect(() => {
  localStorage.setItem("enable3D", enabled3D ? "true" : "false");
}, [enabled3D]);


  if (
    pathname?.startsWith("/reels") ||
    pathname?.startsWith("/direct-messages") ||
    pathname?.startsWith("/chat-ai")
  ) {
    return <>{children}</>;
  }

  // ✅ enabled3D prop'unu destekleyen bileşenlere geçir
  const childWith3D =
  isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, { enabled3D })
    : children;


  return (
    <>
      <div className="mb-4" />
      <LeftBar enabled3D={enabled3D} setEnabled3D={setEnabled3D} />
      <div className="min-h-screen flex">
        <aside className="hidden lg:block lg:w-80" />
        <main className="w-full lg:w-1/2">{childWith3D}</main>
        <aside className="hidden lg:block lg:w-1/1 mt-3 bg-[#000000]">
          <RightBar />
        </aside>
      </div>
      <DesktopMessages />
    </>
  );
}
