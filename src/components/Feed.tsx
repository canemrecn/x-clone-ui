"use client";

import { useState, useEffect } from "react";
import Post from "./Post";

interface FeedProps {
  posts?: any[];    // <--- Burada posts tanımlandı
  lang?: string;
}

export default function Feed({ posts, lang }: FeedProps) {
  const [localPosts, setLocalPosts] = useState<any[]>(posts || []);
  const [loading, setLoading] = useState(!posts);

  useEffect(() => {
    // Eğer dışarıdan posts gelmezse, kendisi fetch yapsın
    if (!posts) {
      async function fetchPosts() {
        try {
          let url = "/api/posts";
          if (lang) {
            url += `?lang=${lang}`;
          }
          const res = await fetch(url);
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
      }
      fetchPosts();
    } else {
      // Dışarıdan gelen posts varsa onu kullan
      setLocalPosts(posts);
      setLoading(false);
    }
  }, [posts, lang]);

  if (loading) {
    return <p>Gönderiler yükleniyor...</p>;
  }

  if (localPosts.length === 0) {
    return <p>Gönderi bulunamadı.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {localPosts.map((post) => (
        <Post key={post.id} postData={post} />
      ))}
    </div>
  );
}
