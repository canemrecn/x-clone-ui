//src/components/Post.tsx
/*Bu dosya, bir sosyal medya gönderisini detaylı şekilde görüntüleyen Post bileşenini içerir; kullanıcı adı, profil fotoğrafı, gönderi 
metni (kelime çeviri özelliğiyle), medya içeriği (resim, video veya YouTube bağlantısı), dil bayrağı, oluşturulma tarihi ve etkileşimler 
(beğeni, yorum sayısı, detay sayfasına link) gibi bilgileri gösterir. Ayrıca kullanıcı yetkiliyse gönderiyi silebilir, herhangi bir 
kullanıcı gönderiyi raporlayabilir veya doğrudan mesaj yoluyla paylaşabilir. Medya dosyasının detayları gerekiyorsa sunucudan alınır 
ve mobil/masaüstü uyumlu şekilde dinamik render edilir.*/
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PostInfo from "./PostInfo";
import PostInteractions from "./PostInteractions";
import Media from "./Video";
import { useAuth } from "@/context/AuthContext";
import YouTubeEmbed from "./YouTubeEmbed";

export interface PostData {
  id: number;
  user_id: number;
  title: string;
  content: string;
  media_file_id?: string;
  media_url?: string;
  media_type?: string;
  username: string;
  full_name: string;
  profile_image?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  lang?: string;
}

interface FileDetailsResponse {
  width: number;
  height: number;
  filePath: string;
  url: string;
  fileType: string;
}

interface PostProps {
  postData: PostData;
}

function findYouTubeLinkInText(text: string): string | null {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
  const match = text.match(regex);
  return match ? match[0] : null;
}

export default function Post({ postData }: PostProps) {
  const [fileDetails, setFileDetails] = useState<FileDetailsResponse | null>(null);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [translatedWord, setTranslatedWord] = useState<string | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!postData.media_file_id) return;
    async function fetchFileDetails() {
      try {
        const res = await fetch(`/api/posts/media?fileId=${postData.media_file_id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Medya bilgisi alınamadı");
        const data = await res.json();
        setFileDetails(data);
      } catch (err) {
        console.error("Dosya bilgisi hatası:", err);
      }
    }
    fetchFileDetails();
  }, [postData.media_file_id]);

  const youTubeLinkInContent = findYouTubeLinkInText(postData.content);
  const isYouTubeLink = postData.media_url && postData.media_url.includes("youtube.com");

  const translateWord = async (word: string) => {
    setHoveredWord(word);
    setTranslatedWord(null);
    setLoadingTranslation(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
        credentials: "include",
      });
      const data = await res.json();
      setTranslatedWord(data.translation || "Çeviri mevcut değil");
    } catch (error) {
      console.error("Çeviri hatası:", error);
    } finally {
      setLoadingTranslation(false);
    }
  };

  async function handleDeletePost() {
    if (!auth?.user) return;
    try {
      const res = await fetch(`/api/posts/delete?postId=${postData.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) window.location.reload();
      else console.error("Gönderi silinemedi.");
    } catch (err) {
      console.error("Gönderi silme hatası:", err);
    }
  }

  async function handleSendPost(buddyId: number) {
    if (!auth?.user) {
      alert("Önce giriş yapmalısınız!");
      return;
    }
    try {
      const res = await fetch("/api/dm_messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ toUserId: buddyId, postId: postData.id }),
      });
      if (!res.ok) throw new Error("Gönderme işlemi başarısız oldu");
      alert("Gönderi başarıyla gönderildi!");
      setShowSendModal(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gönderme işlemi sırasında hata oluştu");
    }
  }

  return (
    <div className="p-4 border-y border-gray-300 w-full max-w-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-800 shadow-md rounded-lg text-white">
      <div className="flex gap-4">
        <Link href={`/${postData.username}`}>
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer">
            <Image src={postData.profile_image || "/icons/pp.png"} alt="Avatar" width={100} height={100} />
          </div>
        </Link>

        <div className="flex-1 flex flex-col gap-2">
          <div className="w-full flex justify-between">
            <div className="flex flex-col">
              <span className="text-md font-bold text-white">@{postData.username}</span>
            </div>
            <div className="relative">
              <button onClick={() => setShowOptions(!showOptions)} className="px-2 py-1 text-white hover:text-orange-500 transition">...</button>
              {showOptions && (
                <div className="absolute right-0 top-full mt-1 bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-300 rounded shadow-md w-24 text-sm">
                  <button onClick={handleDeletePost} className="block w-full text-left px-2 py-1 hover:bg-orange-500 transition text-red-500">Delete</button>
                </div>
              )}
            </div>
          </div>

          <Link href={`/post/${postData.id}`}>
            <h2 className="text-lg font-bold text-white">{postData.title}</h2>
          </Link>

          <p className="break-words whitespace-pre-wrap w-full text-white">
            {postData.content.split(" ").map((word, index) => (
              <span
                key={index}
                className="relative group cursor-pointer mx-1 inline-block"
                onMouseEnter={() => translateWord(word)}
                onMouseLeave={() => setHoveredWord(null)}
              >
                {word}
                {hoveredWord === word && (
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-gray-800 to-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-lg">
                    {loadingTranslation ? "Çeviriliyor..." : translatedWord}
                  </span>
                )}
              </span>
            ))}
          </p>

          {youTubeLinkInContent && (
            <div className="mt-2">
              <YouTubeEmbed url={youTubeLinkInContent} />
            </div>
          )}

          {/* Medya gösterimi */}
          {postData.media_url && (
            <div className="mt-4 max-w-full">
              {isYouTubeLink ? (
                <YouTubeEmbed url={postData.media_url} />
              ) : postData.media_type === "video" ? (
                <div className="w-full max-w-xl mx-auto">
                  <video
                    controls
                    className="w-full max-h-[400px] rounded-lg object-contain"
                  >
                    <source src={postData.media_url} type="video/mp4" />
                    Tarayıcınız video etiketini desteklemiyor.
                  </video>
                </div>
              ) : (
                <div className="w-full max-w-xl mx-auto">
                  <Image
                    src={postData.media_url}
                    alt="Post media"
                    width={800}
                    height={600}
                    className="w-full max-h-[400px] rounded-lg object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {postData.lang && (
            <div className="flex items-center gap-2 text-xs text-white italic">
              <Image
                src={postData.lang === "en" ? "/icons/united-kingdom.png" : "/icons/turkey.png"}
                alt={postData.lang}
                width={25}
                height={25}
              />
            </div>
          )}

          <span className="text-xs text-white">
            {new Date(postData.created_at).toLocaleString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>

          {/* Gönderi ID */}
          <p className="text-xs text-gray-400 mt-2">Gönderi ID: {postData.id}</p> {/* Gönderi ID'si burada gösteriliyor */}

          <PostInteractions
            postId={postData.id}
            initialLikes={postData.likes_count}
            initialComments={postData.comments_count}
          />
        </div>
      </div>
    </div>
  );
}
