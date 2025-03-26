// src/components/PostInteractions.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

interface PostInteractionsProps {
  postId: number;
  initialLikes: number | string;
  initialComments: number | string;
}

export default function PostInteractions({
  postId,
  initialLikes,
  initialComments,
}: PostInteractionsProps) {
  const [likeCount, setLikeCount] = useState(Number(initialLikes) || 0);
  const [commentCount, setCommentCount] = useState(Number(initialComments) || 0);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: localStorage.getItem("token") }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.message === "Post liked") {
        setLikeCount((prev) => prev + 1);
        setIsLiked(true);
      } else if (data.message === "Post unliked") {
        setLikeCount((prev) => (prev > 0 ? prev - 1 : 0));
        setIsLiked(false);
      }
    }
  };

  const handleComment = async () => {
    const text = prompt("Yorumunuzu yazın:") || "";
    if (!text.trim()) return;

    const res = await fetch(`/api/posts/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: localStorage.getItem("token"), text }),
    });

    if (res.ok) {
      setCommentCount((prev) => prev + 1);
    }
  };

  return (
    <div className="flex items-center gap-4 my-2 text-black">
      {/* Yorum Butonu */}
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={handleComment}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            className="fill-[#3E6A8A] group-hover:fill-[#A8DBF0]"
            d="M1.751 10C1.751 5.58 5.335 2 9.756 2h4.366c4.39 0 8.129 3.64 8.129 8.13 
               0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6
               c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 
               3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"
          />
        </svg>
        <span className="group-hover:text-[#A8DBF0] text-sm">{commentCount}</span>
      </div>

      {/* Like Butonu */}
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={handleLike}
      >
        <Image
          src="/icons/like.png"
          alt="Like"
          width={20}
          height={20}
          className={`group-hover:opacity-70 ${isLiked ? "brightness-150" : ""}`}
        />
        <span className="text-sm">{likeCount}</span>
      </div>
    </div>
  );
}
