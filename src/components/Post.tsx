"use client";

import Image from "next/image";
import Link from "next/link";
import PostInfo from "./PostInfo";
import PostInteractions from "./PostInteractions";
import Video from "./Video";
import Image1 from "./image";
import { useState, useEffect } from "react";

interface FileDetailsResponse {
  width: number;
  height: number;
  filePath: string;
  url: string;
  fileType: string;
  customMetadata?: { sensitive: boolean };
}

export interface PostData {
  id: number;
  user_id: number;
  title: string;
  content: string;
  media_file_id?: string;
  username: string;
  full_name: string;
  profile_image?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  lang?: string; // DİL ALANI EKLENDİ
}

interface PostProps {
  postData: PostData;
}

// 1) DİL KODUNU BAYRAK DOSYASIYLA EŞLEŞTİREN NESNE
const langFlags: Record<string, string> = {
  en: "/icons/united-kingdom.png",
  de: "/icons/german-flag.png",
  it: "/icons/italian.png",
  es: "/icons/spain.png",
  ru: "/icons/russia.png",
};

export default function Post({ postData }: PostProps) {
  const [fileDetails, setFileDetails] = useState<FileDetailsResponse | null>(null);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [translatedWord, setTranslatedWord] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log("Post.tsx → postData.id:", postData.id);
  }, [postData.id]);

  useEffect(() => {
    if (!postData.media_file_id) return;
    async function fetchFileDetails() {
      try {
        const res = await fetch(`/api/posts/media?fileId=${postData.media_file_id}`);
        if (!res.ok) {
          throw new Error("Medya bilgisi alınamadı");
        }
        const data = await res.json();
        setFileDetails(data);
      } catch (err) {
        console.error("Dosya bilgisi hatası:", err);
      }
    }
    fetchFileDetails();
  }, [postData.media_file_id]);

  const translateWord = async (word: string) => {
    setHoveredWord(word);
    setTranslatedWord(null);
    setLoading(true);
  
    try {
      // 1) localStorage'dan hedef dili oku
      const targetLang = localStorage.getItem("targetLanguage") || "tr";
  
      // 2) /api/translate'e bu dili gönder
      const res = await fetch("/api/translate", {
        method: "POST",
        body: JSON.stringify({ word, targetLang }),
        headers: { "Content-Type": "application/json" },
      });
  
      const data = await res.json();
      setTranslatedWord(data.translation || "Çeviri mevcut değil");
    } catch (error) {
      console.error("Çeviri hatası:", error);
    } finally {
      setLoading(false);
    }
  };
  const markWordAsRead = async (word: string) => {
    try {
      await fetch("/api/readWord", {
        method: "POST",
        body: JSON.stringify({ word, userId: postData.user_id }),
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Kelime okundu olarak işaretlenemedi:", error);
    }
  };

  return (
    <div className="p-4 border-y-[1px] border-[#BDC4BF] w-full max-w-full overflow-hidden bg-[#FAFCF2] shadow-md rounded-lg">
      <div className="flex gap-4">
        {/* Profil resmine tıklanınca kullanıcının profil sayfasına yönlendirilsin */}
        <Link href={`/${postData.username}`}>
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#3E6A8A] cursor-pointer">
            <Image
              src={postData.profile_image || "/icons/pp.png"}
              alt="Avatar"
              width={100}
              height={100}
            />
          </div>
        </Link>

        <div className="flex-1 flex flex-col gap-2">
          <div className="w-full flex justify-between">
            <div className="flex flex-col">
              <h1 className="text-md font-bold text-black">{postData.title}</h1>
              <span className="text-black text-sm">@{postData.username}</span>
            </div>
            <PostInfo />
          </div>

          <p className="break-words whitespace-pre-wrap w-full text-black">
            {postData.content.split(" ").map((word, index) => (
              <span
                key={index}
                className="relative group cursor-pointer mx-1 inline-block"
                onMouseEnter={() => translateWord(word)}
                onMouseLeave={() => setHoveredWord(null)}
                onClick={() => markWordAsRead(word)}
              >
                {word}
                {hoveredWord === word && (
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-[#3E6A8A] text-[#FAFCF2] text-xs px-2 py-1 rounded-md shadow-lg">
                    {loading ? "Çeviriliyor..." : translatedWord}
                  </span>
                )}
              </span>
            ))}
          </p>

          {fileDetails ? (
            fileDetails.fileType === "image" ? (
              <Image1
                path={fileDetails.filePath}
                alt="Post image"
                w={fileDetails.width}
                h={fileDetails.height}
              />
            ) : (
              <Video path={fileDetails.filePath} />
            )
          ) : postData.media_file_id ? (
            <p className="text-black">Medya yükleniyor...</p>
          ) : null}

          {/* BAYRAK GÖSTERME */}
          {postData.lang && (
            <div className="flex items-center gap-2 text-xs text-gray-500 italic">
              <Image
                src={langFlags[postData.lang] || "/icons/united-kingdom.png"}
                alt={postData.lang}
                width={25}
                height={25}
              />
            </div>
          )}

          <span className="text-[#BDC4BF] text-xs">
            {new Date(postData.created_at).toLocaleString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>

          <PostInteractions
            postId={postData.id}
            initialLikes={postData.likes_count}
            initialComments={postData.comments_count}
          />

          <Link
            href={`/post/${postData.id}`}
            className="text-[#A8DBF0] underline mt-2 hover:text-[#3E6A8A] transition"
          >
            View Post & Comments
          </Link>
        </div>
      </div>
    </div>
  );
}
