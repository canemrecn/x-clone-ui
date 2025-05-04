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
import { useState } from "react";
import { useRouter } from "next/navigation";
import GeminiChat from "./GeminiChat";
import useIsMobile from "@/hooks/useIsMobile";
import Search from "./Search";

const menuList = [
  { id: 1, name: "Homepage", link: "/", icon: "home.svg" },
  { id: 2, name: "Notification", link: "/notifications", icon: "notification.svg" },
  { id: 3, name: "Chat AI", icon: "generative.png" },
  { id: 11, name: "Sentence Structure", link: "/sentence-structure", icon: "write.png" },
  { id: 9, name: "", link: "/reels", icon: "film-reel.png" },
  { id: 10, name: "Daily", link: "/daily", icon: "daily.png" },
  { id: 6, name: "Arrangement", link: "/arrangement", icon: "king.png" },
];

export default function LeftBar() {
  const auth = useAuth();
  const router = useRouter();
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const isMobile = useIsMobile();

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
      {/* MOBİL: Üst Navbar */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-[#1F2937] shadow border-b border-gray-400 flex items-center px-2 py-2 z-[1000]">
        <Link href="/direct-messages" className="p-2">
          <Image src="/icons/send2.png" alt="DM" width={24} height={24} />
        </Link>
        <div className="relative mx-2">
          <button onClick={() => setShowLanguages((prev) => !prev)} className="p-1 rounded-full">
            <Image src="/icons/languages.png" alt="Language" width={24} height={24} />
          </button>
          {showLanguages && (
            <div className="absolute top-10 left-0 bg-white text-black rounded shadow z-[1010]">
              <Link href="/tr" className="p-2 flex items-center">
                <Image src="/icons/turkey.png" alt="tr" width={18} height={18} />
              </Link>
              <Link href="/en" className="p-2 flex items-center">
                <Image src="/icons/united-kingdom.png" alt="en" width={18} height={18} />
              </Link>
            </div>
          )}
        </div>
        <div className="flex-1 mx-1 max-w-[200px]">
          <Search />
        </div>
        {auth?.user && (
          <div className="p-1 relative" onClick={() => setShowUserOptions((prev) => !prev)}>
            <Image
              src={auth.user.profile_image || "/icons/pp.png"}
              alt="Profile"
              width={24}
              height={24}
              className="rounded-full"
            />
            {showUserOptions && (
              <div className="absolute top-10 right-0 bg-white text-black rounded shadow z-[1010]">
                <button onClick={() => router.push("/profile")} className="p-2">Profile</button>
                <button onClick={handleLogout} className="p-2 text-red-500">Logout</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MOBİL: Alt Navbar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#1F2937] shadow border-t border-gray-400 flex justify-around items-center py-2 z-[1000]">
        {menuList.map((item) =>
          item.link ? (
            <Link key={item.id} href={item.link} className="p-2">
              <Image src={`/icons/${item.icon}`} alt={item.name} width={24} height={24} />
            </Link>
          ) : (
            <button key={item.id} onClick={handleChatClick} className="p-2">
              <Image src={`/icons/${item.icon}`} alt={item.name} width={24} height={24} />
            </button>
          )
        )}
      </div>

      {isChatOpen && !isMobile && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1100]">
          <GeminiChat onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </>
  );
}
