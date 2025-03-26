"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface BlockedUser {
  id: number;
  username: string;
  profile_image?: string;
}

export default function BlockedUsersPage() {
  const auth = useAuth();
  const [blockedList, setBlockedList] = useState<BlockedUser[]>([]);

  useEffect(() => {
    if (!auth?.user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    // Engellenen kullanıcıları çek
    async function fetchBlockedUsers() {
      try {
        // /api/block => GET => { blocked: [...] }
        const res = await fetch("/api/block", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBlockedList(data.blocked || []);
        }
      } catch (err) {
        console.error("Engellenenler listesi çekilirken hata:", err);
      }
    }

    fetchBlockedUsers();
  }, [auth?.user]);

  // Engeli kaldır
  async function handleUnblock(userId: number) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/block", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blockedUserId: userId }),
      });
      if (res.ok) {
        // Listeden kaldır
        setBlockedList((prev) => prev.filter((b) => b.id !== userId));
      }
    } catch (err) {
      console.error("Engeli kaldırma hatası:", err);
    }
  }

  if (!auth?.user) {
    return <div className="text-red-500">Lütfen giriş yapın.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4">
      <h1 className="text-xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md">
        Engellenenler
      </h1>

      {blockedList.length === 0 ? (
        <p className="text-white">Hiç kimseyi engellemediniz.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {blockedList.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 bg-gradient-to-br from-gray-800 to-gray-800 rounded hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.profile_image || "/icons/pp.png"}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover border border-gray-300"
                />
                <span className="font-medium text-white">{user.username}</span>
              </div>
              <button
                onClick={() => handleUnblock(user.id)}
                className="bg-gradient-to-br from-gray-800 to-gray-800 text-white px-3 py-1 rounded hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition-all"
              >
                Engeli Kaldır
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
