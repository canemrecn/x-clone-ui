"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PostInfo from "./PostInfo";
import PostInteractions from "./PostInteractions";
import Media from "./Video";
import { useAuth } from "@/context/AuthContext";
import UsersList from "@/app/direct-messages/UsersList";
// YouTube embed bileşenini ekliyoruz
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
  customMetadata?: { sensitive: boolean };
}

interface PostProps {
  postData: PostData;
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

// Metin içinde YouTube linki yakalamak için ek fonksiyon // <-- EKLENDİ
function findYouTubeLinkInText(text: string): string | null {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
  const match = text.match(regex);
  if (match) {
    // Örneğin "https://youtu.be/abcd" ya da "https://www.youtube.com/watch?v=abcd" yakalanır
    return match[0]; // Tam linki döndürüyoruz
  }
  return null;
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
    console.log("Post.tsx → postData.id:", postData.id);
  }, [postData.id]);

  useEffect(() => {
    if (!postData.media_file_id) return;
    async function fetchFileDetails() {
      try {
        const res = await fetch(`/api/posts/media?fileId=${postData.media_file_id}`);
        if (!res.ok) throw new Error("Medya bilgisi alınamadı");
        const data = await res.json();
        setFileDetails(data);
      } catch (err) {
        console.error("Dosya bilgisi hatası:", err);
      }
    }
    fetchFileDetails();
  }, [postData.media_file_id]);

  // Metin içindeki YouTube linkini yakalıyoruz // <-- EKLENDİ
  const youTubeLinkInContent = findYouTubeLinkInText(postData.content);

  const translateWord = async (word: string) => {
    setHoveredWord(word);
    setTranslatedWord(null);
    setLoadingTranslation(true);
    try {
      const targetLang = localStorage.getItem("targetLanguage") || "tr";
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, targetLang }),
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
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`/api/posts/delete?postId=${postData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) window.location.reload();
      else console.error("Gönderi silinemedi.");
    } catch (err) {
      console.error("Gönderi silme hatası:", err);
    }
  }

  function handleReport() {
    router.push(`/report?postId=${postData.id}`);
  }

  // Medya dosyası bilgilerini belirleme
  const effectiveMediaUrl = fileDetails ? fileDetails.url : postData.media_url;
  const effectiveMediaType = fileDetails ? fileDetails.fileType : postData.media_type;
  // Yeni özellik: YouTube link kontrolü (media_url içinde)
  const isYouTubeLink =
    effectiveMediaUrl?.includes("youtube.com") || effectiveMediaUrl?.includes("youtu.be");

  async function handleSendPost(buddyId: number) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Önce giriş yapmalısınız!");
      return;
    }
    try {
      const res = await fetch("/api/dm_messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ toUserId: buddyId, postId: postData.id }),
      });
      if (!res.ok) {
        throw new Error("Gönderme işlemi başarısız oldu");
      }
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
        {/* Profil resmi */}
        <Link href={`/${postData.username}`}>
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer">
            <Image
              src={postData.profile_image || "/icons/pp.png"}
              alt="Avatar"
              width={100}
              height={100}
            />
          </div>
        </Link>

        {/* İçerik alanı */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Üst bilgi (kullanıcı adı ve seçenekler) */}
          <div className="w-full flex justify-between">
            <div className="flex flex-col">
              <span className="text-md font-bold text-white">@{postData.username}</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="px-2 py-1 text-white hover:text-orange-500 transition"
              >
                ...
              </button>
              {showOptions && (
                <div className="absolute right-0 top-full mt-1 bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-300 rounded shadow-md w-24 text-sm">
                  <button
                    onClick={handleReport}
                    className="block w-full text-left px-2 py-1 hover:bg-orange-500 transition"
                  >
                    Report
                  </button>
                  {auth?.user?.id === postData.user_id && (
                    <button
                      onClick={handleDeletePost}
                      className="block w-full text-left px-2 py-1 hover:bg-orange-500 transition text-red-500"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Gönderi metni ve hover ile çeviri */}
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

          {/* Metin içinde YouTube linki varsa, embed olarak göster // <-- EKLENDİ */}
          {youTubeLinkInContent && (
            <div className="mt-2">
              <YouTubeEmbed url={youTubeLinkInContent} />
            </div>
          )}

          {/* Medya gösterimi (media_url) */}
          {effectiveMediaUrl && (
            <>
              {isYouTubeLink ? (
                // YouTube linki tespit edildiyse, küçük oynatıcı (embed) göster
                <YouTubeEmbed url={effectiveMediaUrl} />
              ) : (
                <Media
                  path={effectiveMediaUrl}
                  alt={effectiveMediaType === "image" ? "Post image" : "Post video"}
                  type={effectiveMediaType === "image" ? "image" : "video"}
                />
              )}
            </>
          )}

          {/* Dil bayrağı */}
          {postData.lang && (
            <div className="flex items-center gap-2 text-xs text-white italic">
              <Image
                src={
                  {
                    en: "/icons/united-kingdom.png",
                    de: "/icons/german-flag.png",
                    it: "/icons/italian.png",
                    es: "/icons/spain.png",
                    ru: "/icons/russia.png",
                    tr: "/icons/turkey.png",
                  }[postData.lang] || "/icons/united-kingdom.png"
                }
                alt={postData.lang}
                width={25}
                height={25}
              />
            </div>
          )}

          {/* Tarih */}
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

          {/* Gönderi etkileşimleri */}
          <PostInteractions
            postId={postData.id}
            initialLikes={postData.likes_count}
            initialComments={postData.comments_count}
          />

          {/* Gönderi detaylarına link */}
          <Link
            href={`/post/${postData.id}`}
            className="underline mt-2 text-white hover:text-orange-500 transition"
          >
            View Post & Comments
          </Link>
        </div>
      </div>
    </div>
  );

  // Zaman formatlama fonksiyonu
  function formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }
}
