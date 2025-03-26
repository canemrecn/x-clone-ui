"use client";

import React from "react";

/**
 * URL içinden video ID'sini ayıklamak için basit bir yardımcı fonksiyon
 */
function extractYouTubeVideoId(url: string): string | null {
  // YouTube linklerini yakalamak için basit bir regex
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

interface YouTubeEmbedProps {
  url: string;
}

export default function YouTubeEmbed({ url }: YouTubeEmbedProps) {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    // Geçerli bir video ID bulunamazsa bir mesaj göster
    return <p className="text-red-500">Geçerli bir YouTube linki bulunamadı.</p>;
  }

  // Embed linkini oluşturuyoruz (backtick gerekli!)
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
