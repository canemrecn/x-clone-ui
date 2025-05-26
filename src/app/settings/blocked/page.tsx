//src/app/settings/blocked/page.tsx
/*Bu dosya, giriş yapmış kullanıcının engellediği kullanıcıları listeleyen ve isterse bu engelleri kaldırmasına olanak 
tanıyan bir "Engellenenler" sayfasını oluşturur; /api/block endpoint'i üzerinden veriler çekilir ve silme işlemi JWT 
doğrulamasıyla yapılır; kullanıcı engeli kaldırdığında liste anında güncellenir.*/
// src/app/settings/blocked/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";

interface BlockedUser {
  id: number;
  username: string;
  profile_image?: string;
}

export default function BlockedUsersPage() {
  const auth = useAuth();
  const [blockedList, setBlockedList] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!auth?.user) return;

    async function fetchBlockedUsers() {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        if (!token) return;

        const res = await fetch("/api/block", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setBlockedList(data.blocked || []);
        } else {
          console.error("Failed to fetch blocked users");
        }
      } catch (err) {
        console.error("Error fetching blocked users:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBlockedUsers();
  }, [auth?.user]);

  async function handleUnblock(userId: number) {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const res = await fetch("/api/block", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blockedUserId: userId }),
      });

      if (res.ok) {
        setBlockedList((prev) => prev.filter((b) => b.id !== userId));
      } else {
        console.error("Error unblocking user");
      }
    } catch (err) {
      console.error("Error unblocking user:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!auth?.user) {
    return <div className="text-red-500 text-center py-8">Lütfen giriş yapın.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2b] to-[#2c2c3b] text-white px-6 py-10 pt-24 pb-20">
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 text-center mb-10">
        🚫 Engellenen Kullanıcılar
      </h1>

      {loading ? (
        <p className="text-center text-sm text-gray-400">Yükleniyor...</p>
      ) : blockedList.length === 0 ? (
        <p className="text-center text-gray-400">Hiç kimseyi engellemediniz.</p>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {blockedList.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-xl shadow hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <img
                  src={user.profile_image || "/icons/pp.png"}
                  alt={user.username}
                  className="w-12 h-12 rounded-full border-2 border-gray-600 shadow-sm"
                />
                <span className="font-semibold text-white tracking-wide">{user.username}</span>
              </div>
              <button
                onClick={() => handleUnblock(user.id)}
                className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-orange-500 hover:to-red-500 transition-all font-semibold shadow-md"
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
