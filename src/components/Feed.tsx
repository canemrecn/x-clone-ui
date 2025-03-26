"use client";

import { useState, useEffect } from "react";
import Post from "./Post";
// Örnek reklam bileşeni - siz kendi AdPlaceholder bileşeninizi import edebilirsiniz.
// Aşağıda basit bir placeholder olarak eklenmiştir.
function AdPlaceholder() {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 rounded shadow">
      <p className="font-bold">[ Reklam Alanı ]</p>
    </div>
  );
}

interface FeedProps {
  posts?: any[];
  lang?: string;
}

export default function Feed({ posts, lang }: FeedProps) {
  const [localPosts, setLocalPosts] = useState<any[]>(posts || []);
  const [loading, setLoading] = useState(!posts);

  useEffect(() => {
    // Eğer dışarıdan posts gelmezse, API'den gönderileri çekiyoruz.
    if (!posts) {
      (async function fetchPosts() {
        try {
          let url = "/api/posts";
          if (lang) {
            url += `?lang=${lang}`;
          }
          const token = localStorage.getItem("token") || "";
          const res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) {
            throw new Error("Gönderiler alınamadı");
          }
          const data = await res.json();
          setLocalPosts(data.posts || []);
        } catch (error) {
          console.error("Gönderiler çekilirken hata oluştu:", error);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      // Dışarıdan gelen posts varsa onları kullanıyoruz.
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

  // finalPosts: Her 5 gönderide bir reklam eklemek için yeni bir dizi oluşturuyoruz.
  const finalPosts: Array<any> = [];
  for (let i = 0; i < localPosts.length; i++) {
    // Ekstra özellik: Eğer gönderinin media_url alanı varsa ve YouTube linki içeriyorsa, isYouTube ekle
    const post = { ...localPosts[i] };
    if (
      post.media_url &&
      (post.media_url.includes("youtube.com") || post.media_url.includes("youtu.be"))
    ) {
      post.isYouTube = true;
    }
    finalPosts.push(post);
    // Her 5 gönderide bir, bir reklam öğesi ekle
    if ((i + 1) % 5 === 0) {
      finalPosts.push({ isAd: true, id: `ad-${i}` });
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-br from-gray-800 to-gray-800">
      {finalPosts.map((item) => {
        if (item.isAd) {
          // Reklam göster
          return <AdPlaceholder key={item.id} />;
        } else {
          // Normal gönderi; Post bileşeni içerisinde YouTube link kontrolü yapılacak
          return <Post key={item.id} postData={item} />;
        }
      })}
    </div>
  );
}
