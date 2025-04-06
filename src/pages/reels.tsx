//src/pages/reels.tsx
/*Bu dosya, kullanıcılara dikey kaydırmalı bir "Reels" video akışı deneyimi sunan ReelsPage adlı 
React bileşenini tanımlar. /api/posts?isReel=true endpoint’inden sadece video türündeki gönderileri 
alır, her 5 gönderiden sonra otomatik olarak reklam bileşeni ekler ve videoları tam ekran göstererek 
kullanıcıya kaydırarak gezme (swipe) imkânı verir. Kullanıcılar videoları sesli/sessiz izleyebilir, 
gönderiyi beğenebilir, yorum sayfasına gidebilir veya DM ile başka bir kullanıcıya gönderebilir. 
Mobil ve masaüstü cihazlara duyarlı çalışan sayfa, ayrıca her videonun ilerleme çubuğunu ve açıklamasını da gösterir.*/
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import useSWR from "swr";
import useIsMobile from "@/hooks/useIsMobile";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UsersList from "@/app/direct-messages/UsersList";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.json();
  });

function AdReelPlaceholder() {
  return (
    <div className="h-screen w-screen flex-shrink-0 relative flex items-center justify-center bg-black text-white">
      <p className="text-xl font-bold">[Reklam Reel]</p>
    </div>
  );
}

function ExpandableText({ text, wordLimit = 20 }: { text: string; wordLimit?: number }) {
  const [expanded, setExpanded] = useState(false);
  const words = text.split(" ");
  if (words.length <= wordLimit) return <span>{text}</span>;

  const displayText = expanded ? text : words.slice(0, wordLimit).join(" ") + "... ";

  return (
    <span>
      {displayText}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className="underline text-blue-400 focus:outline-none"
      >
        {expanded ? "Less" : "More"}
      </button>
    </span>
  );
}

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export default function ReelsPage() {
  const { data, error } = useSWR<{ posts: any[] }>("/api/posts?isReel=true", fetcher, {
    revalidateOnFocus: false,
  });

  const finalPosts = useMemo(() => {
    if (!data?.posts) return [];
    const validPosts = data.posts.filter(
      (post) =>
        !post.isLinkShared &&
        post.media_url &&
        post.media_type === "video"
    );
    const arr: Array<any> = [];
    for (let i = 0; i < validPosts.length; i++) {
      arr.push(validPosts[i]);
      if ((i + 1) % 5 === 0) {
        arr.push({ isAd: true, id: `ad-${i}` });
      }
    }
    return arr;
  }, [data?.posts]);

  const [currentReel, setCurrentReel] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSendModal, setShowSendModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number>(0);
  const touchEndYRef = useRef<number>(0);
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleSendPost = async (buddyId: number) => {
    try {
      const res = await fetch("/api/dm_messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ toUserId: buddyId, postId: finalPosts[currentReel].id }),
      });
    } catch (error) {
      console.error("DM gönderim hatası:", error);
    } finally {
      setShowSendModal(false);
    }
  };

  const minSwipeDistance = 50;
  const tapThreshold = 20;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.targetTouches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndYRef.current = e.targetTouches[0].clientY;
  };

  const onTouchEnd = () => {
    const distance = touchStartYRef.current - touchEndYRef.current;
    if (Math.abs(distance) < tapThreshold) return;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        setCurrentReel((prev) => Math.min(prev + 1, finalPosts.length - 1));
      } else {
        setCurrentReel((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setProgress(e.currentTarget.currentTime);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const handleLike = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/posts/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ post_id: postId }),
      });
      if (!res.ok) throw new Error("Beğenme başarısız");
      alert("Beğenildi");
    } catch (err: any) {
      console.error(err);
      alert("Hata: " + err.message);
    }
  };

  const handleComment = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/post/${postId}`);
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.stopPropagation();
    const video = e.currentTarget;
    video.paused ? video.play() : video.pause();
  };

  if (error) return <div className="p-4 text-center text-white">Reels yüklenirken hata oluştu.</div>;
  if (!data) return <div className="p-4 text-center text-white">Yükleniyor...</div>;

  return (
    <>
      <div className="fixed top-0 left-0 z-50">
        <button onClick={() => router.back()} className="px-5 py-1 rounded">
          <Image src="/icons/left.png" alt="Geri" width={24} height={24} />
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative w-screen overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ height: isMobile ? "calc(100vh - 0rem)" : "100vh" }}
      >
        <div className="transition-transform duration-500 ease-in-out" style={{ transform: `translateY(-${currentReel * 100}vh)` }}>
          {finalPosts.map((item, index) => (
            item.isAd ? <AdReelPlaceholder key={item.id} /> : (
              <div key={item.id} className="h-screen w-screen flex-shrink-0 relative">
                <video
                  src={item.media_url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted={index === currentReel ? isMuted : true}
                  loop
                  playsInline
                  onTimeUpdate={index === currentReel ? handleTimeUpdate : undefined}
                  onLoadedMetadata={index === currentReel ? handleLoadedMetadata : undefined}
                  onClick={handleVideoClick}
                />
                <div className="absolute top-10 left-5 flex items-center space-x-2 cursor-pointer" onClick={() => router.push(`/${item.username}`)}>
                  <Image src={item.profile_image || "/icons/pp.png"} alt="Profile" width={40} height={40} className="rounded-full" />
                  <div className="text-white">
                    <div className="font-bold text-lg">{item.full_name}</div>
                    <div className="text-sm">@{item.username}</div>
                  </div>
                </div>

                <div className="absolute bottom-10 right-5 flex flex-col items-end gap-4">
                  <button onClick={() => setShowSendModal(true)}>
                    <Image src="/icons/gonder.png" alt="Gönder" width={30} height={30} />
                  </button>
                  <button onClick={(e) => handleLike(item.id, e)}>
                    <Image src="/icons/like.png" alt="Like" width={50} height={50} />
                    <span>{item.likes_count || 0}</span>
                  </button>
                  <button onClick={(e) => handleComment(item.id, e)}>
                    <Image src="/icons/comment.png" alt="Comment" width={40} height={40} />
                    <span>{item.comments_count || 0}</span>
                  </button>
                </div>

                {index === currentReel && (
                  <div className="absolute top-12 right-5">
                    <button onClick={() => setIsMuted((prev) => !prev)}>
                      <Image src={isMuted ? "/icons/volume-off.png" : "/icons/volume-on.png"} alt="Ses" width={24} height={24} />
                    </button>
                  </div>
                )}

                {index === currentReel && duration > 0 && (
                  <div className="absolute bottom-0 left-0 w-full p-2">
                    <div className="w-full h-2 bg-gray-500">
                      <div className="h-2 bg-white" style={{ width: `${Math.min((progress / duration) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}

                <div className="absolute bottom-10 left-5 text-white text-md drop-shadow-lg">
                  <ExpandableText text={item.content} wordLimit={20} />
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#000000] p-4 rounded shadow-lg w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/gonder.png" alt="Gönder" width={20} height={20} />
              <h2 className="text-white text-lg font-bold">Gönder</h2>
            </div>
            <UsersList onSelectBuddy={(buddyId) => handleSendPost(buddyId)} />
            <button onClick={() => setShowSendModal(false)} className="mt-4 text-white underline">
              Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
}
