"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import Feed from "@/components/Feed";
import WhatToWatchCard from "@/components/WhatToWatchCard";
import Square_Conquest_Game from "@/components/Square_Conquest_Game";
import Search from "@/components/Search";

export default function Homepage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth?.user) {
      router.push("/register");
    }
  }, [auth?.user, router]);

  if (!auth?.user) {
    return null;
  }

  // Dil seçici verileri
  const languages = [
    { code: "tr", image: "/icons/turkey.png" },
    { code: "en", image: "/icons/united-kingdom.png" },
  ];

  // İçerik: Square_Conquest_Game, WhatToWatchCard ve Feed bileşenleri
  const content = useMemo(
    () => (
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-lg shadow-md">
        {/* 
          Mobilde (md:altında) dil seçici üstte,
          arama bileşeni altta görünecek.
          Masaüstünde (md:üstünde) ise yan yana.
        */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          {/* Dil Seçici */}
          <ul className="flex gap-6">
            {languages.map((lang) => (
              <li key={lang.code}>
                <Link href={`/${lang.code}`}>
                  <div className="p-1 rounded transition hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600">
                    <Image src={lang.image} alt={lang.code} width={24} height={24} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Arama Bileşeni */}
          <div className="w-full md:w-auto">
            <Search />
          </div>
        </div>

        <Square_Conquest_Game />
        <WhatToWatchCard />
        <Feed />
      </div>
    ),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 relative">
      <div className="pt-4">{content}</div>
    </div>
  );
}
