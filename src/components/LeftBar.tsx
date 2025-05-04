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

  const [unreadDMCount] = useState(0); // Placeholder

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

  const filteredMenu = menuList.filter((item) => {
    if (!isMobile && (item.id === 8 || item.id === 9)) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* MASAÜSTÜ: Sidebar */}
      <div className="hidden lg:flex flex-col fixed top-0 left-0 w-30 bg-gradient-to-br from-gray-700 to-gray-900 shadow-2xl items-center pt-1 pb-1 z-50">
        <div className="flex justify-center mb-6">
          <Image src="/icons/logom2.png" alt="Logo" width={50} height={50} />
        </div>
        <div className="flex flex-col gap-4 px-2 mt-2">
          {filteredMenu.map((item) =>
            item.link ? (
              <Link
                key={item.id}
                href={item.link}
                className="p-2 rounded-full hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-800 flex items-center gap-4 w-full text-left text-white relative transition"
              >
                <Image src={`/icons/${item.icon}`} alt={item.name} width={24} height={24} />
                <span>{item.name}</span>
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={handleChatClick}
                className="p-2 rounded-full hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-800 flex items-center gap-4 w-full text-left text-white relative transition"
              >
                <Image src={`/icons/${item.icon}`} alt={item.name} width={24} height={24} />
                <span>{item.name}</span>
              </button>
            )
          )}
        </div>
        {auth?.user && (
          <div
            className="flex flex-col items-center relative px-4 py-2 rounded-lg shadow-lg cursor-pointer mx-2  hover:shadow-2xl transition"
            onClick={() => setShowUserOptions((prev) => !prev)}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 relative rounded-full overflow-hidden border-2 border-gray-300">
                <Image src={auth.user.profile_image || "/icons/pp.png"} alt="Profile" width={40} height={40} />
              </div>
            </div>
            {showUserOptions && (
              <div className="mt-2 flex flex-col gap-2">
                <button
                  onClick={() => router.push("/profile")}
                  className="bg-gray-800 text-white px-3 py-1 rounded-md shadow-md hover:bg-gray-700 transition"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded-md shadow-md hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MOBİL: Üst Navbar */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-[#1F2937] shadow-[0_4px_12px_rgba(0,0,0,0.3)] border-b border-gray-400 flex items-center px-3 py-2 z-[1000] backdrop-blur-md">
  {/* Sol: Direct Messages */}
  <Link href="/direct-messages" className="p-2 hover:scale-105 transition-transform duration-200">
    <Image src="/icons/send2.png" alt="DM" width={24} height={24} />
  </Link>

  {/* Dropdown (Dil Seçici) */}
  <div className="relative mx-2">
    <button
      onClick={() => setShowLanguages((prev) => !prev)}
      className="p-1 rounded-full transition"
    >
      <Image src="/icons/languages.png" alt="Language" width={24} height={24} />
    </button>
    {showLanguages && (
      <div className="absolute top-10 left-0 bg-white text-black rounded shadow-lg flex flex-col z-[1010]">
        <Link href="/tr" className="p-2 hover:bg-gray-200 flex items-center gap-2">
          <Image src="/icons/turkey.png" alt="tr" width={18} height={18} />
        </Link>
        <Link href="/en" className="p-2 hover:bg-gray-200 flex items-center gap-2">
          <Image src="/icons/united-kingdom.png" alt="en" width={18} height={18} />
        </Link>
      </div>
    )}
  </div>

  {/* Search (daraltılmış) */}
  <div className="flex-1 mx-1 max-w-[250px]">
    <Search />
  </div>

  {/* Sağ: Profil */}
  {auth?.user && (
    <div className="p-1 relative" onClick={() => setShowUserOptions((prev) => !prev)}>
      <Image
        src={auth.user.profile_image || "/icons/pp.png"}
        alt="Profile"
        width={24}
        height={24}
        className="rounded-full border border-white shadow-lg hover:scale-105 transition-transform duration-200"
      />
      {showUserOptions && (
        <div className="absolute top-12 right-0 rounded-lg px-3 py-2 flex flex-col gap-2 bg-[#f0f0f0] text-[#1c1c1c] z-[1010] shadow-md border border-gray-400">
          <button
            onClick={() => {
              setShowUserOptions(false);
              router.push("/profile");
            }}
            className="hover:text-gray-600 transition"
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="hover:text-red-500 transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )}
</div>

      {/* MOBİL: Alt Navbar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#1F2937] shadow-[0_-4px_12px_rgba(0,0,0,0.3)] border-t border-gray-400 flex justify-around items-center py-2 z-[1000] backdrop-blur-md">
        {menuList.map((item) =>
          item.link ? (
            (isMobile || (item.id !== 9 && item.id !== 8)) && (
              <Link key={item.id} href={item.link} className="p-2 hover:scale-110 transition-transform duration-200">
                <Image src={`/icons/${item.icon}`} alt={item.name} width={28} height={28} />
              </Link>
            )
          ) : (
            <button key={item.id} onClick={handleChatClick} className="p-2 hover:scale-110 transition-transform duration-200">
              <Image src={`/icons/${item.icon}`} alt={item.name} width={28} height={28} />
            </button>
          )
        )}
      </div>

      {isChatOpen && !isMobile && (
        <div className="fixed inset-0 flex items-center justify-center z-[1100] bg-[#000000] bg-opacity-50">
          <GeminiChat onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </>
  );
}
