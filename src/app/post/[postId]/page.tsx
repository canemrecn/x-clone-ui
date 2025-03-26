// src/app/post/[postId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Post from "@/components/Post";
import Comments from "@/components/Comments";
import { PostData } from "@/components/Post";

export default function PostDetailPage() {
  // URL'den postId parametresini alıyoruz
  const { postId } = useParams() as { postId: string };

  const [postData, setPostData] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        // postId parametresiyle /api/posts?post_id=... endpoint'ine istek
        const res = await fetch(`/api/posts?post_id=${postId}`);
        if (!res.ok) throw new Error("Gönderi alınamadı");

        const data = await res.json();

        // data.posts dizisinden ilk postu al
        if (data.posts && data.posts.length > 0) {
          setPostData(data.posts[0]);
        } else {
          setPostData(null);
        }
      } catch (error) {
        console.error("Gönderi detay hatası:", error);
        setPostData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [postId]);

  if (loading) {
    return <p>Loading post...</p>;
  }

  if (!postData) {
    return <p>Post not found</p>;
  }

  return (
    <div className="p-4">
      {/* Gönderiyi tek başına göstermek */}
      <Post postData={postData} />

      {/* Ardından tüm yorumları (tek seferde veya nested) */}
      <Comments postId={Number(postId)} />
    </div>
  );
}
