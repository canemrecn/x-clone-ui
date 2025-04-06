//src/app/api/direct-messages/UserList.tsx
/*Bu dosya, kullanıcının mesajlaştığı kişileri (buddy list) gösteren bir React bileşenidir. Giriş yapan kullanıcının JWT token’ı kullanılarak 
/api/users endpoint’inden mutual takipte olduğu kullanıcılar çekilir ve listelenir. Her kullanıcıya tıklanınca, ilgili kişiden gelen mesajlar 
okunmuş olarak işaretlenir ve eğer onSelectBuddy fonksiyonu tanımlıysa (örneğin masaüstü mesajlaşma panelinden), bu fonksiyon çağrılır; değilse 
kullanıcı /direct-messages?buddyId=... sayfasına yönlendirilir. Ayrıca, yeni mesajlar varsa avatar yanında kırmızı bildirim noktası gösterilir.*/
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie"; // Use js-cookie to manage cookies

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
        const token = Cookies.get("token"); // Retrieve token from cookies
        if (!token) return;

        const res = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in the Authorization header
          },
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
    if (onSelectBuddy) {
      await markMessagesAsRead(buddyId);
      onSelectBuddy(buddyId);
    } else {
      await markMessagesAsRead(buddyId);
      router.push(`/direct-messages?buddyId=${buddyId}`);
    }
  }

  async function markMessagesAsRead(buddyId: number) {
    const token = Cookies.get("token"); // Retrieve token from cookies
    if (!token) return;

    try {
      await fetch("/api/dm_messages/markRead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fromUserId: buddyId }),
      });
      setBuddyList((prev) =>
        prev.map((b) => (b.id === buddyId ? { ...b, hasNewMessage: false } : b))
      );
    } catch (err) {
      console.error("Mesaj okundu işaretlenirken hata:", err);
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
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-4 hover:opacity-80 transition self-start"
      >
        <img
          src="/icons/left.png"
          alt="Geri"
          className="w-5 h-5"
        />
      </button>

      <h2 className="text-lg font-semibold mb-4">Mesajlar</h2>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {buddyList.map((buddy) => (
          <button
            key={buddy.id}
            onClick={() => handleSelectBuddy(buddy.id)}
            className="flex items-center gap-3 p-2 rounded transition-all hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 text-left"
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
