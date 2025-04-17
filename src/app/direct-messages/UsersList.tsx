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
    return <div className="text-red-500">Lütfen giriş yapın.</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 rounded shadow-2xl p-4 text-white">
      <h2 className="text-lg font-semibold mb-4 text-center">Mesajlar</h2>
      <div className="flex flex-col gap-2 overflow-y-auto">
        {buddyList.map((buddy) => (
          <button
            key={buddy.id}
            onClick={() => handleSelectBuddy(buddy.id)}
            className="flex items-center gap-3 p-2 rounded transition-all hover:bg-gray-700 text-left"
          >
            <div className="relative">
              <img
                src={buddy.profile_image || "/icons/pp.png"}
                alt={buddy.username}
                className="w-10 h-10 rounded-full object-cover border border-gray-300 shadow-md"
              />
              {buddy.hasNewMessage && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </div>
            <span className="font-medium">{buddy.username}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
