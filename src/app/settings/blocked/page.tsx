//src/app/settings/blocked/page.tsx
/*Bu dosya, giriş yapmış kullanıcının engellediği kullanıcıları listeleyen ve isterse bu engelleri kaldırmasına olanak 
tanıyan bir "Engellenenler" sayfasını oluşturur; /api/block endpoint'i üzerinden veriler çekilir ve silme işlemi JWT 
doğrulamasıyla yapılır; kullanıcı engeli kaldırdığında liste anında güncellenir.*/
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie"; // Import js-cookie to access cookies

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

    // Engellenen kullanıcıları çekme işlemi
    async function fetchBlockedUsers() {
      setLoading(true);
      try {
        const token = Cookies.get("token"); // Get the token from cookies
        if (!token) return;

        const res = await fetch("/api/block", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Use token in Authorization header
          },
          credentials: "include", // Include cookies
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

  // Engeli kaldırma işlemi
  async function handleUnblock(userId: number) {
    setLoading(true);
    try {
      const token = Cookies.get("token"); // Get the token from cookies
      if (!token) return;

      const res = await fetch("/api/block", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use token in Authorization header
        },
        body: JSON.stringify({ blockedUserId: userId }),
      });

      if (res.ok) {
        // Listeden engellenen kullanıcıyı kaldırıyoruz
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
    return <div className="text-red-500">Lütfen giriş yapın.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4">
      <h1 className="text-xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md">
        Engellenenler
      </h1>

      {loading ? (
        <p className="text-white">Yükleniyor...</p>
      ) : blockedList.length === 0 ? (
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
