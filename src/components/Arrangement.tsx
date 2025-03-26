"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

type TopUser = {
  id: number;
  full_name: string;
  username: string;
  points: number;
  profile_image?: string;
};

export default function Arrangement() {
  const auth = useAuth();
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);

  useEffect(() => {
    fetch("/api/arrangement")
      .then((res) => res.json())
      .then((data) => {
        setTopUsers(data.users || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleFollow = async (userId: number) => {
    if (!auth?.user) return;
    const token = localStorage.getItem("token");
    await fetch("/api/follows", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ following_id: userId, action: "follow" }),
    });
    alert("Followed user id=" + userId);
  };

  return (
    <div className="p-6 rounded-2xl border-[1px] border-[#BDC4BF] bg-[#FAFCF2] shadow-lg">
      <h1 className="text-2xl font-bold text-black text-center pb-4">
        Arrangement
      </h1>

      <div className="flex flex-col gap-4">
        {topUsers.map((u, index) => (
          // Kullanıcıya tıklanınca profil sayfasına yönlendir
          <Link key={u.id} href={`/${u.username}`}>
            <div className="flex items-center justify-between bg-[#A8DBF0] p-3 rounded-lg shadow-md">
              <h1 className="text-xl font-bold text-black">
                {index + 1} {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
              </h1>

              <div className="flex items-center gap-3">
                <div className="relative rounded-full overflow-hidden w-12 h-12 border-2 border-[#3E6A8A] shadow-md">
                  <Image
                    src={u.profile_image || "/icons/pp.png"}
                    alt="Avatar"
                    width={100}
                    height={100}
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-black">
                    {u.full_name}
                  </h1>
                  <span className="text-black text-sm">@{u.username}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleFollow(u.id);
                }}
                className="py-1 px-4 font-semibold bg-[#3E6A8A] text-white rounded-full shadow-md hover:bg-[#2C4D66] transition-all"
              >
                Follow
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
