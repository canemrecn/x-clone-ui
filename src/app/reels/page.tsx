//src/app/reels/page.tsx
/*Bu dosya, kullanıcılara dikey kaydırmalı bir "Reels" video akışı deneyimi sunan ReelsPage adlı 
React bileşenini tanımlar. /api/posts?isReel=true endpoint’inden sadece video türündeki gönderileri 
alır, her 5 gönderiden sonra otomatik olarak reklam bileşeni ekler ve videoları tam ekran göstererek 
kullanıcıya kaydırarak gezme (swipe) imkânı verir. Kullanıcılar videoları sesli/sessiz izleyebilir, 
gönderiyi beğenebilir, yorum sayfasına gidebilir veya DM ile başka bir kullanıcıya gönderebilir. 
Mobil ve masaüstü cihazlara duyarlı çalışan sayfa, ayrıca her videonun ilerleme çubuğunu ve açıklamasını da gösterir.*/
"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UsersList from "@/app/direct-messages/UsersList";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function ReelsPage() {
  const { data } = useSWR<{ posts: any[] }>("/api/posts/reels", fetcher, {
    revalidateOnFocus: false,
  });

  const rawVideos = useMemo(() => {
    if (!data?.posts) return [];
    return data.posts.filter((p) => p.media_type === "video");
  }, [data?.posts]);

  const finalPosts = useMemo(() => {
    const combined: any[] = [];
    rawVideos.forEach((item, i) => {
      combined.push(item);
      if ((i + 1) % 5 === 0) {
        combined.push({ isAd: true, id: `ad-${i}` });
      }
    });
    return combined;
  }, [rawVideos]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSendModal, setShowSendModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [likeEffect, setLikeEffect] = useState(false);

  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const scrollLocked = useRef(false);
  const touchStartY = useRef(0);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollLocked.current) return;
    scrollLocked.current = true;
    setTimeout(() => (scrollLocked.current = false), 800);

    if (e.deltaY > 0) {
      setCurrentIndex((prev) => Math.min(prev + 1, finalPosts.length - 1));
    } else {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;

    if (Math.abs(deltaY) < 50 || scrollLocked.current) return;
    scrollLocked.current = true;
    setTimeout(() => (scrollLocked.current = false), 800);

    if (deltaY > 0) {
      setCurrentIndex((prev) => Math.min(prev + 1, finalPosts.length - 1));
    } else {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.muted = false;
          video.play().catch(() => {});
        } else {
          video.pause();
          video.muted = true;
        }
      }
    });
  }, [currentIndex]);

  const handleLike = async (postId: number) => {
    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });
      setLikeEffect(true);
      setTimeout(() => setLikeEffect(false), 1000);
    } catch (err) {
      console.error("Be\u011fenme hatas\u0131:", err);
    }
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <button onClick={() => router.back()}>
          <Image src="/icons/left.png" alt="back" width={30} height={30} />
        </button>
      </div>

      <div
        ref={containerRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-screen h-screen overflow-hidden"
      >
        {finalPosts.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
              index === currentIndex
                ? "opacity-100 z-30"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {item.isAd ? (
              <div className="w-full h-full bg-gray-900 text-white flex items-center justify-center text-2xl">
                \ud83d\udce2 Reklam Alan\u0131 - Undergo Sponsorlu \u0130\u00e7erik
              </div>
            ) : (
              <>
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[index] = el;
                  }}
                  src={item.media_url}
                  className="w-full h-full object-cover"
                  autoPlay={index === currentIndex}
                  muted={index !== currentIndex}
                  loop
                  playsInline
                  onTimeUpdate={
                    index === currentIndex
                      ? (e) => setProgress(e.currentTarget.currentTime)
                      : undefined
                  }
                  onLoadedMetadata={
                    index === currentIndex
                      ? (e) => setDuration(e.currentTarget.duration)
                      : undefined
                  }
                  onClick={(e) => {
                    const video = e.currentTarget;
                    video.paused ? video.play() : video.pause();
                  }}
                  onDoubleClick={() => handleLike(item.id)}
                />

                {index === currentIndex && likeEffect && (
                  <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="text-white text-6xl animate-ping font-bold select-none">
                      \u2764\ufe0f
                    </div>
                  </div>
                )}

                {index === currentIndex && (
                  <div className="absolute bottom-14 right-4 z-40 flex flex-col gap-4 items-center">
                    <button
                      onClick={() => setShowSendModal(true)}
                      className="bg-black/40 p-2 rounded-full"
                    >
                      <Image src="/icons/gonder.png" alt="G\u00f6nder" width={30} height={30} />
                    </button>
                    <button
                      onClick={() => handleLike(item.id)}
                      className="bg-black/40 p-2 rounded-full"
                    >
                      <Image src="/icons/like.png" alt="Like" width={30} height={30} />
                    </button>
                    <button
                      onClick={() => router.push(`/post/${item.id}`)}
                      className="bg-black/40 p-2 rounded-full"
                    >
                      <Image src="/icons/comment.png" alt="Comment" width={30} height={30} />
                    </button>
                  </div>
                )}

                {index === currentIndex && (
                  <div className="absolute bottom-16 left-4 text-white z-40 max-w-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Image
                        src={item.profile_image || "/icons/pp.png"}
                        alt="pp"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-bold text-sm">@{item.username}</p>
                        <p className="text-sm">{item.full_name}</p>
                      </div>
                    </div>
                  </div>
                )}

                {index === currentIndex && duration > 0 && (
                  <div className="absolute bottom-1 left-0 w-full px-4 z-50">
                    <p className="text-sm break-words text-white mb-1">
                      {item.content || "Undergo"}
                    </p>
                    <div className="w-full h-1 bg-gray-500">
                      <div
                        className="h-1 bg-white"
                        style={{ width: `${(progress / duration) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-black p-4 rounded shadow-lg w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/gonder.png" alt="G\u00f6nder" width={20} height={20} />
              <h2 className="text-white text-lg font-bold">G\u00f6nder</h2>
            </div>
            <UsersList
              onSelectBuddy={async (buddyId) => {
                const postId = finalPosts[currentIndex]?.id;
                if (!buddyId || !postId) {
                  alert("Al\u0131c\u0131 veya g\u00f6nderi ID\u2019si eksik!");
                  return;
                }
                try {
                  const response = await fetch("/api/dm_messages/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ toUserId: buddyId, postId }),
                  });
                  const result = await response.json();
                  if (response.ok) {
                    alert("G\u00f6nderildi!");
                    setShowSendModal(false);
                  } else {
                    alert(`Hata: ${result.error}`);
                  }
                } catch (error) {
                  console.error("DM g\u00f6nderme hatas\u0131:", error);
                  alert("Sunucu hatas\u0131 olu\u015ftu.");
                }
              }}
            />
            <button onClick={() => setShowSendModal(false)} className="mt-4 text-white underline">
              Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
}