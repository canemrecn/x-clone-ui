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
  const { data } = useSWR<{ posts: any[] }>("/api/posts?isReel=true", fetcher, {
    revalidateOnFocus: false,
  });

  const finalPosts = useMemo(() => {
    if (!data?.posts) return [];
    return data.posts.filter((p) => p.media_type === "video");
  }, [data?.posts]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const isMuted = false;
  const [showSendModal, setShowSendModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [screenHeight, setScreenHeight] = useState(800);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🎯 SCROLL tabanlı video geçişi
  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const newIndex = Math.round(scrollTop / screenHeight);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  useEffect(() => {
    const video = videoRefs.current[currentIndex];
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, [currentIndex]);

  return (
    <>
      {/* Geri Dön Butonu */}
      <div className="fixed top-4 left-4 z-50">
        <button onClick={() => router.back()}>
          <Image src="/icons/left.png" alt="back" width={30} height={30} />
        </button>
      </div>

      {/* Reels Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory bg-black"
      >
        {finalPosts.map((item, index) => (
          <div
            key={item.id}
            className="relative w-screen snap-start flex justify-center items-center"
            style={{ height: `${screenHeight}px` }}
          >
            <video
              ref={(el) => {
                if (el) videoRefs.current[index] = el;
              }}
              src={item.media_url}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay={index === currentIndex}
              muted={isMuted}
              loop
              playsInline
              onTimeUpdate={index === currentIndex ? (e) => setProgress(e.currentTarget.currentTime) : undefined}
              onLoadedMetadata={index === currentIndex ? (e) => setDuration(e.currentTarget.duration) : undefined}
              onClick={(e) => {
                const video = e.currentTarget;
                video.paused ? video.play() : video.pause();
              }}
            />

            {/* Sağ Alt Butonlar */}
{index === currentIndex && (
  <div className="absolute bottom-14 right-4 z-40 flex flex-col gap-4 items-center">
    {/* Paylaş */}
    <button onClick={() => setShowSendModal(true)} className="bg-black/40 p-2 rounded-full">
      <Image src="/icons/gonder.png" alt="Gönder" width={30} height={30} />
    </button>

    {/* Beğen */}
    <button
      onClick={async () => {
        try {
          await fetch(`/api/posts/${item.id}/like`, {
            method: "POST",
            credentials: "include",
          });
          alert("Beğendin!");
        } catch (error) {
          console.error("Beğenme hatası:", error);
          alert("Beğenirken bir hata oluştu.");
        }
      }}
      className="bg-black/40 p-2 rounded-full"
    >
      <Image src="/icons/like.png" alt="Like" width={30} height={30} />
    </button>

    {/* Yorum */}
    <button
      onClick={() => router.push(`/post/${item.id}`)}
      className="bg-black/40 p-2 rounded-full"
    >
      <Image src="/icons/comment.png" alt="Comment" width={30} height={30} />
    </button>
  </div>
)}

            {/* Kullanıcı Bilgisi */}
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

            {/* Açıklama + Progress */}
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
          </div>
        ))}
      </div>

      {/* Gönder Modalı */}
{showSendModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
    <div className="bg-black p-4 rounded shadow-lg w-full max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <Image src="/icons/gonder.png" alt="Gönder" width={20} height={20} />
        <h2 className="text-white text-lg font-bold">Gönder</h2>
      </div>

      {/* Kullanıcı listesi */}
      <UsersList
  onSelectBuddy={async (buddyId) => {
    const postId = finalPosts[currentIndex]?.id;
    if (!buddyId || !postId) {
      alert("Alıcı veya gönderi ID’si eksik!");
      return;
    }

    try {
      const response = await fetch("/api/dm_messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          toUserId: buddyId,    // ✅ backend’in beklediği isim
          postId: postId,       // ✅ gönderi ID’si
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Gönderildi!");
        setShowSendModal(false);
      } else {
        alert(`Hata: ${result.error}`);
      }
    } catch (error) {
      console.error("DM gönderme hatası:", error);
      alert("Sunucu hatası oluştu.");
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
