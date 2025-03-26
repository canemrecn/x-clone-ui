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
  // DesktopMessages.tsx vs. 'onSelectBuddy' şeklinde bir prop atıyorsak
  onSelectBuddy?: (buddyId: number) => void;
}

export default function UsersList({ onSelectBuddy }: UsersListProps) {
  const auth = useAuth();
  const router = useRouter();
  const [buddyList, setBuddyList] = useState<Buddy[]>([]);

  useEffect(() => {
    if (!auth?.user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    async function fetchBuddies() {
      try {
        const res = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBuddyList(data.users || []);
        }
      } catch (error) {
        console.error("Kullanıcı listesi çekilirken hata:", error);
      }
    }
    fetchBuddies();
  }, [auth?.user]);

  async function handleSelectBuddy(buddyId: number) {
    // Masaüstü panelinden geliyorsa => onSelectBuddy
    if (onSelectBuddy) {
      // Mesajları okundu işaretleme vb.
      await markMessagesAsRead(buddyId);
      onSelectBuddy(buddyId);
    } else {
      // Normal akış => direct-messages sayfasına push
      await markMessagesAsRead(buddyId);
      router.push(`/direct-messages?buddyId=${buddyId}`);
    }
  }

  // Mesajları okundu işaretle
  async function markMessagesAsRead(buddyId: number) {
    const token = localStorage.getItem("token");
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
      // Local state güncelle => hasNewMessage = false
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

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 rounded shadow-2xl p-4 text-white">
      {/* Geri Butonu */}
      <button
        onClick={() => router.push("/")}
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
