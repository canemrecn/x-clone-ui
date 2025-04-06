// src/components/YoutubeEmbed.tsx
/*Bu dosya, verilen bir YouTube URL'sinden video ID’sini ayıklayarak ilgili videoyu iframe aracılığıyla sayfada 
gömülü (embed) şekilde oynatmaya yarayan YouTubeEmbed adlı React bileşenini tanımlar; eğer geçerli bir YouTube 
bağlantısı değilse hata mesajı gösterir, aksi takdirde responsive (duyarlı) bir şekilde videoyu render eder.*/
"use client";

import React from "react";

// URL içinden video ID'sini ayıklamak için basit bir yardımcı fonksiyon
function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

interface YouTubeEmbedProps {
  url: string;
}

export default function YouTubeEmbed({ url }: YouTubeEmbedProps) {
  if (!url || typeof url !== "string") {
    return <p className="text-red-500">Geçersiz YouTube URL'si.</p>; // URL geçerli değilse, hata mesajı göster
  }

  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return <p className="text-red-500">Geçerli bir YouTube linki bulunamadı.</p>;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="relative w-full h-56 md:h-72 lg:h-80 overflow-hidden rounded-md">
      <iframe
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
