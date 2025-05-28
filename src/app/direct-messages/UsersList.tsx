// src/app/direct-messages/UsersList.tsx

/*
Bu dosya, kullanıcının mesajlaştığı kişileri (buddy list) gösteren bir React bileşenidir.
Giriş yapan kullanıcının JWT token’ı kullanılarak /api/users endpoint’inden mutual takipte olduğu kullanıcılar çekilir ve listelenir.
Her kullanıcıya tıklanınca, ilgili kişiden gelen mesajlar okunmuş olarak işaretlenir ve eğer onSelectBuddy fonksiyonu tanımlıysa
(örneğin masaüstü mesajlaşma panelinden), bu fonksiyon çağrılır; değilse kullanıcı /direct-messages?buddyId=... sayfasına yönlendirilir.
Ayrıca, yeni mesajlar varsa avatar yanında kırmızı bildirim noktası gösterilir.
*/
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
  onClose?: () => void;
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
        const res = await fetch("/api/users", { credentials: "include" });
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
        headers: { "Content-Type": "application/json" },
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
    <div className="flex flex-col w-full h-full bg-[#1f1f2d] text-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700 bg-[#2b2b3b]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/')}
            className="text-white text-2xl font-bold hover:text-pink-500"
          >
            ←
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
            Mesajlar
          </h1>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-lg font-bold"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {buddyList.map((buddy) => (
          <button
            key={buddy.id}
            onClick={() => handleSelectBuddy(buddy.id)}
            className="w-full flex items-center gap-3 p-3 bg-[#2c2c3e] rounded-xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition"
          >
            <div className="relative">
              <img
                src={buddy.profile_image || "/icons/pp.png"}
                alt={buddy.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
              />
              {buddy.hasNewMessage && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#2c2c3e] animate-pulse" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-white truncate">{buddy.username}</p>
            </div>
          </button>
        ))}

        {buddyList.length === 0 && (
          <p className="text-center text-sm text-gray-400">Mesajlaşmak için bir kullanıcı bulunamadı.</p>
        )}
      </div>
    </div>
  );
}