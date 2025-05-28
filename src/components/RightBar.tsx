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
    <div className="hidden lg:flex flex-col fixed top-0 right-0 w-94 justify-between z-50">
      <Search />
      <Arrangement />
      <Notes />

      <div className="mt-6 px-4 py-3 text-sm text-white border-t border-gray-700">
        <h3 className="font-semibold mb-2 text-lg text-gray-300">🔥 Popüler Etiketler</h3>
        <ul className="space-y-1">
          {hashtags.map((tag) => (
            <li key={tag.tag}>
              <Link
                href={`/hashtag/${encodeURIComponent(tag.tag)}`}
                className="text-blue-400 hover:underline"
              >
                #{tag.tag} ({tag.count})
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
