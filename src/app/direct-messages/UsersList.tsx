// src/app/direct-messages/UsersList.tsx
"use client";

/*
Bu dosya, kullanıcının mesajlaştığı kişileri (buddy list) gösteren bir React bileşenidir.
Giriş yapan kullanıcının JWT token’ı kullanılarak /api/users endpoint’inden mutual takipte olduğu kullanıcılar çekilir ve listelenir.
Her kullanıcıya tıklanınca, ilgili kişiden gelen mesajlar okunmuş olarak işaretlenir ve eğer onSelectBuddy fonksiyonu tanımlıysa
(örneğin masaüstü mesajlaşma panelinden), bu fonksiyon çağrılır; değilse kullanıcı /direct-messages?buddyId=... sayfasına yönlendirilir.
Ayrıca, yeni mesajlar varsa avatar yanında kırmızı bildirim noktası gösterilir.
*/

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Buddy {
  id: number;
  username: string;
  profile_image?: string;
  hasNewMessage?: boolean;
}

interface UsersListProps {
  onSelectBuddy?: (buddyId: number) => void;
  onClose?: () => void; // ✅ HATA BURADAN DÜZELTİLDİ
}

export default function UsersList({ onSelectBuddy, onClose }: UsersListProps) {
  const auth = useAuth();
  const router = useRouter();
  const [buddyList, setBuddyList] = useState<Buddy[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.user) return;

    async function fetchBuddies() {
      try {
        const res = await fetch("/api/users", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setBuddyList(data.users || []);
        } else {
          throw new Error("Error fetching buddies");
        }
      } catch (err) {
        console.error("Kullanıcı listesi çekilirken hata:", err);
        setError("Kullanıcı listesi yüklenemedi.");
      }
    }

    fetchBuddies();
  }, [auth?.user]);

  async function handleSelectBuddy(buddyId: number) {
    try {
      await fetch("/api/dm_messages/markRead", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fromUserId: buddyId }),
      });
    } catch (err) {
      console.error("Mesaj okundu işaretlenirken hata:", err);
    }

    if (onSelectBuddy) {
      onSelectBuddy(buddyId);
    } else {
      router.push(`/direct-messages?buddyId=${buddyId}`);
    }
  }

  if (!auth?.user) {
    return <div className="text-red-500 text-center py-4">Lütfen giriş yapın.</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="flex flex-col w-full h-full px-4 pt-6 pb-4 bg-gradient-to-br from-[#1e1e2f] to-[#2a2a3f] text-white rounded-l-xl shadow-lg">
      <div className="flex items-center justify-between mb-6 px-1">
  <h2 className="left-0 text-xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 flex items-center gap-2">
    <img src="/icons/messages.png" alt="icon" className="w-5 h-5" />
    Mesajlar
  </h2>
  {onClose && (
    <button onClick={onClose} className="text-sm text-gray-400 hover:text-red-500 font-bold">
      ✕
    </button>
  )}
</div>


      <div className="flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent pr-1">
        {buddyList.map((buddy) => (
          <button
            key={buddy.id}
            onClick={() => handleSelectBuddy(buddy.id)}
            className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-lg hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300 group shadow-sm"
          >
            <div className="relative">
              <img
                src={buddy.profile_image || "/icons/pp.png"}
                alt={buddy.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 group-hover:border-white"
              />
              {buddy.hasNewMessage && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse" />
              )}
            </div>
            <span className="font-medium group-hover:text-white tracking-wide">
              {buddy.username}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
