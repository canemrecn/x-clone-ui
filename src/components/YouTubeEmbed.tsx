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
      } else if (urlObj.hostname.includes("youtube.com")) {
        return urlObj.searchParams.get("v");
      }
      return null;
    } catch {
      return null;
    }
  };

  const videoId = getYouTubeId(url);

  if (!videoId) {
    return <p className="text-red-500 text-sm">Geçersiz YouTube bağlantısı</p>;
  }

  return (
    <div className="w-full aspect-video mt-3 rounded-lg overflow-hidden shadow-md">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-presentation allow-popups"
        onError={() => {
          window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
        }}
      ></iframe>

      {/* Alternatif bağlantı */}
      <p className="text-center text-sm text-gray-400 mt-2">
        Video çalışmıyorsa{" "}
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          className="text-blue-400 underline"
        >
          YouTube'da izleyin
        </a>
        .
      </p>
    </div>
  );
}
