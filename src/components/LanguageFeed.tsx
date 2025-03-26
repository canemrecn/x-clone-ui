"use client";

import useSWR from "swr";
import Share from "./Share";
import Post from "./Post";
import { useMemo, useEffect, useState } from "react";

// Örnek reklam bileşeni. Kendi tasarımınızı veya bileşeninizi kullanabilirsiniz.
function AdPlaceholder() {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 rounded shadow my-4">
      <p className="font-bold text-center">[ Reklam Alanı ]</p>
    </div>
  );
}

interface LanguageFeedProps {
  lang: string;
}

const fetcher = (url: string) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return res.json();
  });
};

export default function LanguageFeed({ lang }: LanguageFeedProps) {
  const { data, error } = useSWR<{ posts: any[] }>(
    `/api/posts?lang=${lang}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Gönderiler
  const posts = data?.posts || [];

  // "her 5 gönderide bir reklam" mantığı => finalPosts dizisi
  const finalPosts = useMemo(() => {
    const arr: Array<any> = [];
    for (let i = 0; i < posts.length; i++) {
      arr.push(posts[i]);
      // 5'in katına gelince reklam ekle
      if ((i + 1) % 5 === 0) {
        arr.push({ isAd: true, id: `ad-${i}` });
      }
    }
    return arr;
  }, [posts]);

  // finalPosts'i render
  const renderedItems = useMemo(
    () =>
      finalPosts.map((item) => {
        if (item.isAd) {
          // Reklam bileşeni
          return <AdPlaceholder key={item.id} />;
        }
        // Normal gönderi
        return <Post key={item.id} postData={item} />;
      }),
    [finalPosts]
  );

  return (
    <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-700 text-white">
      <h1 className="mb-4 text-center">
        {lang.toUpperCase()} PAGE ŞUAN SADECE İNGİLİZCE VE TÜRKÇE ÜZERİNDEN ÇEVİRİ YAPILMAKTADIR. ÇOK
        YAKINDA TÜM DİLLERDEN ÇEVİRİ ÖZELLİĞİ GELECEKTİR. BEKLEMEDE KALIN
      </h1>
      <Share lang={lang} />
      {error ? (
        <p className="text-center">Error loading posts.</p>
      ) : !data ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="flex flex-col gap-4">{renderedItems}</div>
      )}
    </div>
  );
}
