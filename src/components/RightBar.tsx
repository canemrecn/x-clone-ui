//src/components/RightBar.tsx
/*Bu dosya, yalnızca masaüstü (large screen) kullanıcılarına gösterilen sabit bir sağ panel (RightBar) 
bileşeni tanımlar. Panelde sırasıyla kullanıcı sıralaması (Arrangement), notlar (Notes), bir reklam alanı 
(AdPlaceholder) ve en altta hizmet koşulları, gizlilik ve çerez politikası gibi yasal bağlantılar yer alır. 
Görsel olarak üstten alta düzenlenmiş, sabit konumlu ve duyarlı bir şekilde tasarlanmıştır.*/
"use client";

import React, { useEffect, useState } from "react";
import Arrangement from "@/components/Arrangement";
import Notes from "@/components/Notes";
import Search from "./Search";
import Link from "next/link";

export default function RightBar() {
  const [hashtags, setHashtags] = useState<{ tag: string; count: number }[]>([]);

  useEffect(() => {
    async function fetchHashtags() {
      try {
        const res = await fetch("/api/popular-hashtags");
        const data = await res.json();
        setHashtags(data.tags || []);
      } catch (error) {
        console.error("Etiketler alınamadı:", error);
      }
    }
    fetchHashtags();
  }, []);

  return (
    <div className="hidden lg:flex flex-col fixed top-0 right-0 w-94 justify-between z-50 not-3d">
      <Search />
      <Arrangement />
      <Notes />

      <div className="mt-6 px-4 py-4 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-inner border border-gray-700 mx-4">
        <h3 className="font-semibold text-white text-lg mb-3 flex items-center gap-2">
          <span>🔥</span> Popüler Etiketler
        </h3>
        <div className="flex flex-wrap gap-2">
          {hashtags.map((tag) => (
            <Link
              key={tag.tag}
              href={`/hashtag/${encodeURIComponent(tag.tag)}`}
              className="bg-gray-700 hover:bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm px-3 py-1 rounded-full transition duration-200 shadow hover:scale-105"
            >
              #{tag.tag}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
