//src/components/Feed.tsx
/*Bu dosya, sosyal medya uygulamasında gönderi akışını (Feed) yöneten bileşeni tanımlar; posts verisi dışarıdan gelmezse API'den gönderileri çeker, 
gönderilerin her 5 tanesinden sonra bir reklam (AdPlaceholder) yerleştirir, YouTube bağlantısı içeren medyalara isYouTube işaretini ekler ve her 
gönderiyi Post bileşeni ile ekrana render eder; dil filtresi (lang) desteği de vardır.*/
// src/components/Feed.tsx
"use client";

import { useState, useEffect } from "react";
import Post from "./Post";
import { useAuth } from "@/context/AuthContext";
import Share from "./Share";

interface FeedProps {
  posts?: any[];
  lang?: string;
}

export default function Feed({ posts, lang }: FeedProps) {
  const [localPosts, setLocalPosts] = useState<any[]>(posts || []);
  const [loading, setLoading] = useState(!posts);
  const auth = useAuth();

  useEffect(() => {
    if (!posts) {
      (async function fetchPosts() {
        try {
          let url = "/api/feed";
          if (lang) {
            url += `?lang=${lang}`;
          }

          const res = await fetch(url, { credentials: "include" });
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
    return (
      <p className="text-center text-sm text-gray-400 animate-pulse mt-10 p-4 mb-4 not-3d">
        Gönderiler yükleniyor...
      </p>
    );
  }

  if (localPosts.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 mt-10 p-4 mb-4 not-3d">
        Gönderi bulunamadı.
      </p>
    );
  }

  const finalPosts = localPosts.map((post) => {
    if (
      post.media_url &&
      (post.media_url.includes("youtube.com") || post.media_url.includes("youtu.be"))
    ) {
      return { ...post, isYouTube: true };
    }
    return post;
  });

  return (
    <div className="not-3d">
      <div className="mb-4">
        <Share />
      </div>

      {finalPosts.map((post) => (
        <Post key={post.id} postData={post} />
      ))}
    </div>
  );
}
