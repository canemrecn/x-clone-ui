// src/components/YoutubeEmbed.tsx
/*Bu dosya, verilen bir YouTube URL'sinden video ID’sini ayıklayarak ilgili videoyu iframe aracılığıyla sayfada 
gömülü (embed) şekilde oynatmaya yarayan YouTubeEmbed adlı React bileşenini tanımlar; eğer geçerli bir YouTube 
bağlantısı değilse hata mesajı gösterir, aksi takdirde responsive (duyarlı) bir şekilde videoyu render eder.*/
"use client";

import React from "react";

interface YouTubeEmbedProps {
  url: string;
}

export default function YouTubeEmbed({ url }: YouTubeEmbedProps) {
  const getYouTubeId = (youtubeUrl: string) => {
    try {
      const urlObj = new URL(youtubeUrl);

      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      }

      if (urlObj.hostname.includes("youtube.com")) {
        const vParam = urlObj.searchParams.get("v");
        if (vParam) return vParam;

        // Destek: /embed/ID gibi yollar için
        const match = urlObj.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
        if (match) return match[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  const videoId = getYouTubeId(url);

  if (!videoId) {
    return (
      <div className="text-red-400 text-sm italic mt-2">
        ⚠️ Geçersiz YouTube bağlantısı
      </div>
    );
  }

  return (
    <div className="w-full aspect-video mt-3 rounded-lg overflow-hidden shadow-lg">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
}
