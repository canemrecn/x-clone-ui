// src/components/LeftBar.tsx

/*
Bu bileşen, kullanıcının kimliğine göre dinamik olarak menü ve kullanıcı bilgilerini gösteren bir sol menü (LeftBar) sunar.
Masaüstünde sabit bir sidebar, mobilde ise alt sabit bir navbar olarak davranır.
HTTP-only cookie uyumludur; logout işlemi dahil fetch çağrıları context içinde yapılır ve credentials: "include" desteklenmelidir.
*/
"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GeminiChat from "./GeminiChat";
import useIsMobile from "@/hooks/useIsMobile";
import Search from "./Search";
import dynamic from "next/dynamic";

interface LeftBarProps {
  enabled3D: boolean;
  setEnabled3D: React.Dispatch<React.SetStateAction<boolean>>;
}

const menuList = [
  { id: 1, name: "Homepage", link: "/", icon: "home1.png" },
  { id: 2, name: "Notification", link: "/notifications", icon: "notification2.png" },
  { id: 3, name: "Chat AI", icon: "ai4.png" },
  { id: 9, name: "", link: "/reels", icon: "film-reel.png" },
  { id: 10, name: "Daily", link: "/daily", icon: "daily.png" },
  { id: 6, name: "Arrangement", link: "/arrangement", icon: "king.png" },
];

export default function LeftBar({ enabled3D, setEnabled3D }: LeftBarProps) {
  const auth = useAuth();
  const router = useRouter();
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (enabled3D) {
      document.documentElement.classList.add("three-d-mode");
    } else {
      document.documentElement.classList.remove("three-d-mode");
    }
  }, [enabled3D]);

  const handleLogout = async () => {
    try {
      if (auth?.logout) {
        await auth.logout();
      }
      setShowUserOptions(false);
    } catch (err) {
      console.error("Logout hatası:", err);
    }
  };

  const handleChatClick = () => {
    if (isMobile) {
      router.push("/chat-ai");
    } else {
      setIsChatOpen(true);
    }
  };

  return (
    <>
      {/* MASAÜSTÜ: Sidebar */}
      <div className="hidden lg:flex flex-col fixed top-0 left-0 w-20 h-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black shadow-xl items-center pt-6 pb-6 z-[1000] rounded-tr-2xl rounded-br-2xl">
        <Image src="/icons/logo22.png" alt="Logo" width={40} height={40} className="mb-6" />
        <div className="flex flex-col gap-6">
          {menuList
            .filter((item) => item.id !== 9)
            .map((item) =>
              item.link ? (
                <Link key={item.id} href={item.link} className="hover:scale-110 transition-transform duration-200 ease-in-out">
                  <Image src={`/icons/${item.icon}`} alt={item.name} width={28} height={28} />
                </Link>
              ) : (
                <button key={item.id} onClick={handleChatClick} className="hover:scale-110 transition-transform duration-200 ease-in-out">
                  <Image src={`/icons/${item.icon}`} alt={item.name} width={28} height={28} />
                </button>
              )
            )}
        </div>
      </div>

      {/* MASAÜSTÜ: Sol Alt Profil + 3D İKONU */}
      {auth?.user && (
        <div className="hidden lg:flex fixed bottom-4 left-4 z-[1050] flex-col items-center gap-3">
          <div className="relative">
            <Image
              src={auth.user.profile_image || "/icons/pp.png"}
              alt="Profile"
              width={50}
              height={50}
              className="rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-105 transition-all duration-200"
              onClick={() => setShowUserOptions((prev) => !prev)}
            />
            {showUserOptions && (
              <div className="absolute bottom-14 left-0 bg-white text-sm text-black rounded-xl shadow-lg p-3 w-32 space-y-1">
                <button onClick={() => router.push("/profile")} className="block w-full text-left p-1 hover:bg-gray-100">
                  Profile
                </button>
                <button onClick={handleLogout} className="block w-full text-left p-1 text-red-500 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* 3D Toggle Button */}
          <button onClick={() => setEnabled3D((prev) => !prev)} className="hover:scale-110 transition-transform duration-200">
            <Image
              src={`/icons/${enabled3D ? "3d1.png" : "3d2.png"}`}
              alt="3D Toggle"
              width={28}
              height={28}
            />
          </button>
        </div>
      )}

      {/* MOBİL: Üst Navbar */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-gray-900 shadow-md border-b border-gray-700 flex items-center px-4 py-3 z-[1000]">
        <button onClick={() => setEnabled3D((prev) => !prev)} className="mr-2">
          <Image src={`/icons/${enabled3D ? "3d1.png" : "3d2.png"}`} alt="3D Toggle" width={24} height={24} />
        </button>

        <Link href="/direct-messages" className="p-2">
          <Image src="/icons/send2.png" alt="DM" width={24} height={24} />
        </Link>

        <div className="flex-1 mx-1 max-w-[300px]">
          <Search />
        </div>

        {auth?.user && (
          <div className="p-1 relative right-0" onClick={() => setShowUserOptions((prev) => !prev)}>
            <Image
              src={auth.user.profile_image || "/icons/pp.png"}
              alt="Profile"
              width={34}
              height={34}
              className="rounded-full"
            />
            {showUserOptions && (
              <div className="absolute top-10 right-0 bg-white text-black rounded-xl shadow-lg z-[1010]">
                <button onClick={() => router.push("/profile")} className="p-2 w-full text-left hover:bg-gray-100 rounded">Profile</button>
                <button onClick={handleLogout} className="p-2 w-full text-left text-red-500 hover:bg-gray-100 rounded">Logout</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MOBİL: Alt Navbar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-gray-900 shadow-inner border-t border-gray-700 flex justify-around items-center py-3 z-[1000]">
        {menuList.map((item) =>
          item.link ? (
            <Link key={item.id} href={item.link} className={`p-2 ${item.id === 9 ? "block" : ""}`}>
              <Image src={`/icons/${item.icon}`} alt={item.name} width={24} height={24} />
            </Link>
          ) : (
            <button key={item.id} onClick={handleChatClick} className="p-2">
              <Image src={`/icons/${item.icon}`} alt={item.name} width={24} height={24} />
            </button>
          )
        )}
      </div>

      {/* Chat Modal (Masaüstü için) */}
      {isChatOpen && !isMobile && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[1100]">
          <GeminiChat onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </>
  );
}
