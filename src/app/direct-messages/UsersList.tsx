//src/app/api/direct-messages/UserList.tsx
/*Bu dosya, kullanıcının mesajlaştığı kişileri (buddy list) gösteren bir React bileşenidir. Giriş yapan kullanıcının JWT token’ı kullanılarak 
/api/users endpoint’inden mutual takipte olduğu kullanıcılar çekilir ve listelenir. Her kullanıcıya tıklanınca, ilgili kişiden gelen mesajlar 
okunmuş olarak işaretlenir ve eğer onSelectBuddy fonksiyonu tanımlıysa (örneğin masaüstü mesajlaşma panelinden), bu fonksiyon çağrılır; değilse 
kullanıcı /direct-messages?buddyId=... sayfasına yönlendirilir. Ayrıca, yeni mesajlar varsa avatar yanında kırmızı bildirim noktası gösterilir.*/
"use client";

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
}

export default function UsersList({ onSelectBuddy }: UsersListProps) {
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
        setError("Unable to load buddy list");
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
  <div className="flex flex-col w-full h-full p-6 bg-gradient-to-br from-[#1c1c2b] to-[#2a2a3f] text-white rounded-xl shadow-lg">
    <h2 className="text-2xl font-extrabold mb-6 text-center border-b border-gray-700 pb-3 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
      📩 Mesajlar
    </h2>
    <div className="flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      {buddyList.map((buddy) => (
        <button
          key={buddy.id}
          onClick={() => handleSelectBuddy(buddy.id)}
          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 group shadow-md hover:shadow-lg text-left"
        >
          <div className="relative">
            <img
              src={buddy.profile_image || "/icons/pp.png"}
              alt={buddy.username}
              className="w-11 h-11 rounded-full object-cover border-2 border-gray-600 group-hover:border-white transition-all"
            />
            {buddy.hasNewMessage && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-ping" />
            )}
          </div>
          <span className="text-lg font-semibold text-white group-hover:text-white tracking-wide">
            {buddy.username}
          </span>
        </button>
      ))}
    </div>
  </div>
);

}
