//src/components/Feed.tsx
/*Bu dosya, sosyal medya uygulamasında gönderi akışını (Feed) yöneten bileşeni tanımlar; posts verisi dışarıdan gelmezse API'den gönderileri çeker, 
gönderilerin her 5 tanesinden sonra bir reklam (AdPlaceholder) yerleştirir, YouTube bağlantısı içeren medyalara isYouTube işaretini ekler ve her 
gönderiyi Post bileşeni ile ekrana render eder; dil filtresi (lang) desteği de vardır.*/
// src/components/Feed.tsx
"use client";

import { useState, useEffect } from "react";
import Post from "./Post";
import AdPlaceholder from "./AdPlaceholder";
import { useAuth } from "@/context/AuthContext"; // Importing AuthContext for managing authentication

interface FeedProps {
  posts?: any[];
  lang?: string;
}

export default function Feed({ posts, lang }: FeedProps) {
  const [localPosts, setLocalPosts] = useState<any[]>(posts || []);
  const [loading, setLoading] = useState(!posts);
  const auth = useAuth(); // Using authentication context

  useEffect(() => {
    if (!posts) {
      (async function fetchPosts() {
        try {
          let url = "/api/posts";
          if (lang) {
            url += `?lang=${lang}`;
          }
          const res = await fetch(url, { credentials: "include" }); // Sending the request with credentials
          if (!res.ok) throw new Error("Gönderiler alınamadı");
          const data = await res.json();
          setLocalPosts(data.posts || []);
        } catch (error) {
          console.error("Gönderiler çekilirken hata oluştu:", error);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLocalPosts(posts);
      setLoading(false);
    }
  }, [posts, lang]);

  if (loading) {
    return <p className="text-center text-white">Gönderiler yükleniyor...</p>;
  }

  if (localPosts.length === 0) {
    return <p className="text-center text-white">Gönderi bulunamadı.</p>;
  }

  const finalPosts: Array<any> = [];
  for (let i = 0; i < localPosts.length; i++) {
    const post = { ...localPosts[i] };
    if (post.media_url && (post.media_url.includes("youtube.com") || post.media_url.includes("youtu.be"))) {
      post.isYouTube = true;
    }
    finalPosts.push(post);
    if ((i + 1) % 5 === 0) {
      finalPosts.push({ isAd: true, id: `ad-${i}` });
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-br from-gray-800 to-gray-800">
      {finalPosts.map((item) => {
        if (item.isAd) {
          return <AdPlaceholder key={item.id} />; // Render the ad
        } else {
          return <Post key={item.id} postData={item} />; // Render the post
        }
      })}
    </div>
  );
}
