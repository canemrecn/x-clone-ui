//src/components/LanguageFeed.tsx
/*Bu dosya, belirli bir dil (lang) parametresine göre filtrelenmiş gönderileri /api/posts?lang=... endpoint'inden çeken ve 
kullanıcıya bu gönderileri listeleyen LanguageFeed bileşenini tanımlar; her beş gönderiden sonra bir reklam bileşeni 
(AdPlaceholder) eklenir, hata veya yüklenme durumları için kullanıcıya bilgi verilir ve ayrıca yeni gönderi paylaşımı 
için Share bileşeni de içerir.*/
// src/components/LanguageFeed.tsx
// src/components/LanguageFeed.tsx
"use client";

import useSWR from "swr";
import Share from "./Share";
import Post from "./Post";
import { useMemo, useEffect, useState } from "react";

// AdPlaceholder component (for ads every 5th post)
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

// Define fetcher function to fetch posts, ensuring token is sent via cookies (credentials: 'include')
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      return res.json();
    })
    .catch((error) => {
      console.error("Error fetching posts:", error);
      throw error;
    });

export default function LanguageFeed({ lang }: LanguageFeedProps) {
  const { data, error } = useSWR<{ posts: any[] }>(
    `/api/posts?lang=${lang}`, 
    fetcher, 
    { revalidateOnFocus: false }
  );

  // If posts are available, handle them with pagination and ads
  const posts = data?.posts || [];

  // Add ad after every 5 posts
  const finalPosts = useMemo(() => {
    const arr: any[] = [];
    for (let i = 0; i < posts.length; i++) {
      arr.push(posts[i]);
      if ((i + 1) % 5 === 0) {
        arr.push({ isAd: true, id: `ad-${i}` });
      }
    }
    return arr;
  }, [posts]);

  // Render posts and ads
  const renderedItems = useMemo(
    () =>
      finalPosts.map((item) =>
        item.isAd ? <AdPlaceholder key={item.id} /> : <Post key={item.id} postData={item} visiblePostId={item.id} />

      ),
    [finalPosts]
  );

  // Handle loading and error states
  return (
    <div className="p-4 pt-24 pb-20 text-white">
      <h1 className="mb-4 text-center">
        {lang.toUpperCase()} PAGE ŞUAN SADECE İNGİLİZCE VE TÜRKÇE ÜZERİNDEN ÇEVİRİ YAPILMAKTADIR. ÇOK
        YAKINDA TÜM DİLLERDEN ÇEVİRİ ÖZELLİĞİ GELECEKTİR. BEKLEMEDE KALIN
      </h1>
      <Share/>
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
