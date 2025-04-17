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
  // YouTube video ID'sini linkten ayıkla
  const getYouTubeId = (youtubeUrl: string) => {
    try {
      const urlObj = new URL(youtubeUrl);
      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      } else if (urlObj.hostname.includes("youtube.com")) {
        return urlObj.searchParams.get("v");
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const videoId = getYouTubeId(url);

  if (!videoId) return <div className="text-red-400">Geçersiz YouTube bağlantısı</div>;

  return (
    <div className="w-full aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-lg"
      ></iframe>
    </div>
  );
}
