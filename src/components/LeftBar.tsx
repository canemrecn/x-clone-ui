// src/app/components/LeftBar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GeminiChat from "./GeminiChat";

const menuList = [
  { id: 1, name: "Homepage", link: "/", icon: "home.svg" },
  { id: 2, name: "Notification", link: "/notifications", icon: "notification.svg" },
  { id: 3, name: "Chat AI", icon: "generative.png" },
  { id: 7, name: "Notes", link: "/notes", icon: "sticky-notes.png" },
  { id: 6, name: "Overall Ranking", link: "/arrangement", icon: "king.png" },
  // DM için linki "/direct-messages" olarak ayarlıyoruz:
  { id: 8, name: "Direct Messages", link: "/direct-messages", icon: "messages.svg" },
];

export default function LeftBar() {
  const auth = useAuth();
  const router = useRouter();
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      // Tailwind "md" breakpoint ~768px
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    if (auth && typeof auth.logout === "function") {
      auth.logout();
    }
    setShowUserOptions(false);
  };

  // Chat AI butonuna tıklandığında
  const handleChatClick = () => {
    if (isMobile) {
      router.push("/chat-ai");
    } else {
      setIsChatOpen(true);
    }
  };

  return (
    <>
      {/* MASAÜSTÜ: Sol sabit sidebar */}
      <div
        className="
          hidden
          lg:flex
          flex-col
          fixed
          top-14
          left-60
          w-64
          bg-white
          shadow-md
          border-r
          border-[#BDC4BF]
          justify-between
          pt-5
          pb-9
          z-50
        "
      >
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="/icons/SON_logo2.png"
            alt="Logo"
            width={300}
            height={300}
          />
        </div>

        {/* Menü Listesi */}
        <div className="flex flex-col gap-4 px-2 mt-2">
          {menuList.map((item) =>
            item.link ? (
              <Link
                key={item.id}
                href={item.link}
                className="p-2 rounded-full hover:bg-[#A8DBF0] flex items-center gap-4 w-full text-left text-[#3E6A8A]"
              >
                <Image
                  src={`/icons/${item.icon}`}
                  alt={item.name}
                  width={24}
                  height={24}
                />
                <span>{item.name}</span>
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={handleChatClick}
                className="p-2 rounded-full hover:bg-[#A8DBF0] flex items-center gap-4 w-full text-left text-[#3E6A8A]"
              >
                <Image
                  src={`/icons/${item.icon}`}
                  alt={item.name}
                  width={24}
                  height={24}
                />
                <span>{item.name}</span>
              </button>
            )
          )}
        </div>

        {/* Kullanıcı Bilgileri (Masaüstü) */}
        {auth?.user && (
          <div
            className="flex flex-col items-center relative px-4 py-2 rounded-lg shadow-lg cursor-pointer mx-2"
            onClick={() => setShowUserOptions((prev) => !prev)}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 relative rounded-full overflow-hidden border-2 border-[#3E6A8A]">
                <Image
                  src={auth.user.profile_image || "/icons/pp.png"}
                  alt="Profile"
                  width={40}
                  height={40}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#3E6A8A]">{auth.user.full_name}</span>
                <span className="text-sm text-[#3E6A8A]">@{auth.user.username}</span>
              </div>
            </div>
            {showUserOptions && (
              <div className="mt-2 flex flex-col gap-2">
                <button
                  onClick={() => router.push("/profile")}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md shadow-md hover:bg-blue-700 transition"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded-md shadow-md hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MOBİL: Alt sabit navbar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#6e7b8b] shadow-lg border-t border-[#BDC4BF] flex justify-around py-2 z-[1000] items-center">
        {menuList.map((item) =>
          item.link ? (
            <Link key={item.id} href={item.link} className="p-2">
              <Image src={`/icons/${item.icon}`} alt={item.name} width={30} height={30} />
            </Link>
          ) : (
            <button key={item.id} onClick={handleChatClick} className="p-2">
              <Image src={`/icons/${item.icon}`} alt={item.name} width={30} height={30} />
            </button>
          )
        )}
        {auth?.user && (
          <div className="p-2 relative" onClick={() => setShowUserOptions((prev) => !prev)}>
            <div className="w-8 h-8 relative rounded-full overflow-hidden border-2 border-[#3E6A8A]">
              <Image
                src={auth.user.profile_image || "/icons/pp.png"}
                alt="Profile"
                width={32}
                height={32}
              />
            </div>
            {showUserOptions && (
              <div className="absolute bottom-10 right-0 bg-[#A8DBF0] rounded-md shadow-md px-3 py-1 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowUserOptions(false);
                    router.push("/profile");
                  }}
                  className="text-[#3E6A8A]"
                >
                  Profile
                </button>
                <button onClick={handleLogout} className="text-[#3E6A8A]">
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MASAÜSTÜ: Chat Modal (örneğin Chat AI için) */}
      {isChatOpen && !isMobile && (
        <div className="fixed inset-0 flex items-center justify-center z-[1100] bg-black bg-opacity-50">
          <GeminiChat onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </>
  );
}
