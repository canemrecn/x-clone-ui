//src/components/Arrangement.tsx
/*Bu dosya, sosyal medya uygulamasında en yüksek puanlı kullanıcıları sıralayan ve her birinin profiline bağlantı sağlayan Arrangement 
bileşenini tanımlar; kullanıcılar sıralama listesinde gösterilir, profil fotoğrafları ve kullanıcı adlarıyla birlikte listelenir ve giriş 
yapmış kullanıcılar bu listedeki kişileri "Follow" butonuna basarak takip edebilir; ayrıca veri SWR ile /api/arrangement endpoint'inden 
çekilir ve takip işlemi sonrasında liste güncellenir.*/
// src/components/Arrangement.tsx
"use client";

import useSWR, { mutate } from "swr";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useCallback, useMemo } from "react";

type TopUser = {
  id: number;
  full_name: string;
  username: string;
  points: number;
  profile_image?: string;
};

// SWR fetcher: Token is sent via HTTP-only cookies for authentication.
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) {
      throw new Error(`Error fetching arrangement: ${res.status}`);
    }
    return res.json();
  });

export default function Arrangement() {
  const auth = useAuth();
  const { data, error } = useSWR<{ users: TopUser[] }>("/api/arrangement", fetcher, {
    revalidateOnFocus: false,
  });

  const handleFollow = useCallback(
    async (userId: number) => {
      if (!auth?.user) {
        alert("Lütfen giriş yapın.");
        return;
      }
      try {
        const res = await fetch("/api/follows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ following_id: userId, action: "follow" }),
        });
        if (res.ok) {
          mutate("/api/arrangement");
        } else {
          const errorData = await res.json();
          alert("Takip işlemi başarısız oldu: " + (errorData.message || ""));
        }
      } catch (err: any) {
        console.error("Follow error:", err);
      }
    },
    [auth]
  );

  const renderedUsers = useMemo(() => {
    if (!data?.users || data.users.length === 0) {
      return <p className="text-center text-gray-300">No users found.</p>;
    }
    return data.users.map((u, index) => (
      <Link key={u.id} href={`/${u.username}`}>
        <div className="flex items-center justify-between bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-xl shadow-lg hover:ring-2 hover:ring-orange-400 transition-all duration-200">
          <h1 className="text-xl font-extrabold text-white">
            {index + 1} {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 shadow">
              <Image
                src={u.profile_image || "/icons/pp.png"}
                alt="Avatar"
                width={100}
                height={100}
                priority
              />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-100">{u.full_name}</h1>
              <span className="text-sm text-gray-400">@{u.username}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleFollow(u.id);
            }}
            className="py-1 px-4 font-medium bg-gradient-to-br from-orange-500 to-yellow-500 text-white rounded-full shadow hover:brightness-110 transition-all"
          >
            Follow
          </button>
        </div>
      </Link>
    ));
  }, [data, handleFollow]);

  if (error) {
    return <p className="text-center text-red-500">Error: {error.message}</p>;
  }
  if (!data) {
    return <p className="text-center text-gray-300">Loading...</p>;
  }

  return (
    <div className="p-6 rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl">
      <h1 className="text-2xl font-bold text-center pb-4 text-white tracking-wide">Arrangement</h1>
      <div className="flex flex-col gap-6">{renderedUsers}</div>
    </div>
  );
}

