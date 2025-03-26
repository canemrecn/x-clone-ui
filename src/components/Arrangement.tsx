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

const fetcher = (url: string) =>
  fetch(url).then((res) => {
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
      if (!auth?.user) return;
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("/api/follows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ following_id: userId, action: "follow" }),
        });
        if (res.ok) {
          mutate("/api/arrangement");
        }
      } catch (err: any) {
        console.error("Follow error:", err);
      }
    },
    [auth]
  );

  const renderedUsers = useMemo(() => {
    if (!data?.users || data.users.length === 0) {
      return <p className="text-center text-white">No users found.</p>;
    }
    return data.users.map((u, index) => (
      <Link key={u.id} href={`/${u.username}`}>
        <div className="flex items-center justify-between bg-gradient-to-br from-gray-800 to-gray-700 p-3 rounded-lg shadow-2xl hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition-all">
          <h1 className="text-xl font-bold text-white">
            {index + 1}{" "}
            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative rounded-full overflow-hidden w-12 h-12 border-2 border-gray-300 shadow-md">
              <Image
                src={u.profile_image || "/icons/pp.png"}
                alt="Avatar"
                width={100}
                height={100}
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{u.full_name}</h1>
              <span className="text-sm text-white">@{u.username}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleFollow(u.id);
            }}
            className="py-1 px-4 font-semibold bg-gradient-to-br from-gray-800 to-gray-700 text-white rounded-full shadow-md hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition-all"
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
    return <p className="text-center text-white">Loading...</p>;
  }

  return (
    <div className="p-6 rounded-2xl border border-gray-300 bg-gradient-to-br from-gray-800 to-gray-700 shadow-2xl">
      <h1 className="text-2xl font-bold text-center pb-4 text-white">Arrangement</h1>
      <div className="flex flex-col gap-4">{renderedUsers}</div>
    </div>
  );
}
