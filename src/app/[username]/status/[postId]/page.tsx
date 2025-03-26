// src/app/[username]/status/[postId]/page.tsx

"use client";

import { useAuth } from "@/context/AuthContext";
import Post from "@/components/Post";
import Comments from "@/components/Comments";
import Image1 from "@/components/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PostData } from "@/components/Post";

export default function StatusPage({
  params,
}: {
  params: { username: string; postId: string };
}) {
  const auth = useAuth();

  const [postData, setPostData] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts?post_id=${params.postId}`);
        if (!res.ok) throw new Error("Post fetch error");
        const data = await res.json();
        if (data.posts && data.posts.length > 0) {
          setPostData(data.posts[0]);
        } else {
          setPostData(null);
        }
      } catch (err) {
        console.error("Post fetch error:", err);
        setPostData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [params.postId]);

  return (
    <div className="min-h-screen bg-[#bcd2ee] text-black">
      {/* Üst Kısım */}
      <div className="flex items-center gap-8 sticky top-0 backdrop-blur-lg p-4 z-10 bg-gradient-to-r from-[#bcd2ee] via-[#bcd2ee] to-[#BDC4BF] shadow-md">
        <Link href="/">
          <Image1 path="icons/back.svg" alt="back" w={24} h={24} />
        </Link>
        <h1 className="font-bold text-lg text-black">
          {params.username}'s Post (ID: {params.postId})
        </h1>
      </div>

      {/* İçerik Alanı */}
      <div className="max-w-3xl mx-auto mt-6 p-6 bg-white shadow-lg rounded-xl border border-[#BDC4BF]">
        {loading ? (
          <p className="p-4 text-center text-black">Loading post...</p>
        ) : !postData ? (
          <p className="p-4 text-center text-black">Post not found.</p>
        ) : (
          <div>
            <Post postData={postData} />
            {/* <Comments postId={Number(params.postId)} /> */}
          </div>
        )}
      </div>
    </div>
  );
}
