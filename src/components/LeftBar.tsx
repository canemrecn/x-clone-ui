"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GeminiChat from "./GeminiChat";
import useIsMobile from "@/hooks/useIsMobile";

const menuList = [
  { id: 1, name: "Discover", link: "/", icon: "home.svg" },
  { id: 2, name: "Notification", link: "/notifications", icon: "notification.svg" },
  { id: 3, name: "Chat AI", icon: "generative.png" },
  { id: 9, name: "Reels", link: "/reels", icon: "film-reel.png" },
  { id: 7, name: "Notes", link: "/notes", icon: "sticky-notes.png" },
  { id: 6, name: "Overall Ranking", link: "/arrangement", icon: "king.png" },
  { id: 8, name: "Direct Messages", link: "/direct-messages", icon: "messages.png" },
];

export default function LeftBar() {
  const auth = useAuth();
  const router = useRouter();
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMobile = useIsMobile();

  const [unreadDMCount] = useState(0); // Placeholder

  const handleLogout = () => {
    if (auth && typeof auth.logout === "function") {
      auth.logout();
    }
    setShowUserOptions(false);
  };

  const handleChatClick = () => {
    if (isMobile) {
      router.push("/chat-ai");
    } else {
      setIsChatOpen(true);
    }
  };

  // Masaüstü görünümünde DM (id:8) ve Reels (id:9) seçenekleri gizlenecek
  const filteredMenu = menuList.filter((item) => {
    if (!isMobile && (item.id === 8 || item.id === 9)) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* MASAÜSTÜ: Sol sabit sidebar - Gelişmiş ışıklandırma ve gölgeler */}
      <div className="hidden lg:flex flex-col fixed top-16 left-0 w-64 bg-gradient-to-br from-gray-700 to-gray-900 shadow-2xl justify-between pt-5 pb-9 z-50">
        <div className="flex justify-center mb-6">
          <Image src="/icons/logom2.png" alt="Logo" width={100} height={100} />
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
            className="flex flex-col items-center relative px-4 py-2 rounded-lg shadow-lg cursor-pointer mx-2 bg-gray-800 hover:shadow-2xl transition"
            onClick={() => setShowUserOptions((prev) => !prev)}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 relative rounded-full overflow-hidden border-2 border-gray-300">
                <Image src={auth.user.profile_image || "/icons/pp.png"} alt="Profile" width={40} height={40} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white">{auth.user.full_name}</span>
                <span className="text-sm text-white">@{auth.user.username}</span>
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

      {/* MOBİL: Alt sabit navbar (değiştirilmedi) */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#3B3B3B] shadow-lg border-t border-[#D9D9D9] flex justify-around py-2 z-[1000] items-center">
        {menuList.map((item) =>
          item.link ? (
            // REELS seçeneği sadece mobilde gösterilecek
            (isMobile || (item.id !== 9 && item.id !== 8)) && (
              <Link key={item.id} href={item.link} className="p-2 relative">
                <Image src={`/icons/${item.icon}`} alt={item.name} width={30} height={30} />
              </Link>
            )
          ) : (
            <button key={item.id} onClick={handleChatClick} className="p-2">
              <Image src={`/icons/${item.icon}`} alt={item.name} width={30} height={30} />
            </button>
          )
        )}
        {auth?.user && (
          <div className="p-2 relative" onClick={() => setShowUserOptions((prev) => !prev)}>
            <div className="w-8 h-8 relative rounded-full overflow-hidden ">
              <Image src={auth.user.profile_image || "/icons/pp.png"} alt="Profile" width={32} height={32} />
            </div>
            {showUserOptions && (
              <div className="absolute bottom-10 right-0 rounded-md px-3 py-1 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowUserOptions(false);
                    router.push("/profile");
                  }}
                  className="text-[#FFFFFF]"
                >
                  Profile
                </button>
                <button onClick={handleLogout} className="text-[#FFFFFF]">
                  Logout
                </button>
              </div>
            )}
          </div>
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
