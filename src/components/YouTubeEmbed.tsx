// src/components/YoutubeEmbed.tsx
/*Bu dosya, verilen bir YouTube URL'sinden video ID’sini ayıklayarak ilgili videoyu iframe aracılığıyla sayfada 
gömülü (embed) şekilde oynatmaya yarayan YouTubeEmbed adlı React bileşenini tanımlar; eğer geçerli bir YouTube 
bağlantısı değilse hata mesajı gösterir, aksi takdirde responsive (duyarlı) bir şekilde videoyu render eder.*/
"use client";

import React from "react";
import Image from "next/image";

interface YouTubeEmbedProps {
  url: string;
}

export default function YouTubeEmbed({ url }: YouTubeEmbedProps) {
  const getYouTubeId = (youtubeUrl: string) => {
    try {
      const urlObj = new URL(youtubeUrl);
      if (urlObj.hostname === "youtu.be") return urlObj.pathname.slice(1);
      if (urlObj.hostname.includes("youtube.com")) return urlObj.searchParams.get("v");
    } catch (err) {
      return null;
    }
  };

  const videoId = getYouTubeId(url);
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  if (!videoId) {
    return <p className="text-red-500 text-sm">Geçersiz YouTube bağlantısı</p>;
  }

  return (
    <div className="relative w-full aspect-video group cursor-pointer rounded-xl overflow-hidden border border-gray-700 shadow-md">
      <a
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-70 transition"
      >
        <Image
          src="/icons/youtube.png"
          alt="YouTube'da izle"
          width={200}
          height={200}
          className="opacity-90 hover:opacity-100 transition"
        />
      </a>
    </div>
  );
}
