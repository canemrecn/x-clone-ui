//src/components/Post.tsx
/*Bu dosya, bir sosyal medya gönderisini detaylı şekilde görüntüleyen Post bileşenini içerir; kullanıcı adı, profil fotoğrafı, gönderi 
metni (kelime çeviri özelliğiyle), medya içeriği (resim, video veya YouTube bağlantısı), dil bayrağı, oluşturulma tarihi ve etkileşimler 
(beğeni, yorum sayısı, detay sayfasına link) gibi bilgileri gösterir. Ayrıca kullanıcı yetkiliyse gönderiyi silebilir, herhangi bir 
kullanıcı gönderiyi raporlayabilir veya doğrudan mesaj yoluyla paylaşabilir. Medya dosyasının detayları gerekiyorsa sunucudan alınır 
ve mobil/masaüstü uyumlu şekilde dinamik render edilir.*/
// src/components/Post.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PostInteractions from "./PostInteractions";
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

interface PostProps {
  postData: PostData;
}

export default function Post({ postData }: PostProps) {
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);
  const [correctTranslation, setCorrectTranslation] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  const [showInput, setShowInput] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showPointAnim, setShowPointAnim] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [completedTranslations, setCompletedTranslations] = useState<Set<number>>(new Set());
  const auth = useAuth();
  const router = useRouter();

  const translateWordWithInput = async (word: string, index: number) => {
    if (completedTranslations.has(index)) {
      setHoveredWordIndex(index);
      setShowInput(false);
      setFeedback("✅ Bu çeviriyi zaten yaptınız.");
      return;
    }

    setHoveredWordIndex(index);
    setCorrectTranslation(null);
    setUserInput("");
    setShowInput(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          word,
          targetLang: "tr",
        }),
      });

      const data = await res.json();
      setCorrectTranslation(data.translation);
    } catch (error) {
      console.error("Çeviri hatası:", error);
      setCorrectTranslation("Hata");
    }
  };

  const checkTranslation = async (index: number) => {
    if (userInput.trim().toLowerCase() === correctTranslation?.toLowerCase()) {
      setFeedback("✅ Doğru! +1 puan");
      setShowPointAnim(true);
      setCompletedTranslations((prev) => new Set(prev).add(index));

      // ✅ Puan ekleme çağrısı
      try {
        await fetch("/api/updatePoints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ points: 1 }),
        });
      } catch (err) {
        console.error("Puan güncelleme hatası:", err);
      }

      setTimeout(() => setShowPointAnim(false), 1500);
    } else {
      setFeedback(`❌ Yanlış. Doğru: ${correctTranslation}`);
    }

    setTimeout(() => {
      setHoveredWordIndex(null);
      setShowInput(false);
      setUserInput("");
      setFeedback(null);
    }, 2000);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Gönderiyi silmek istediğinize emin misiniz?");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/posts/delete/${postData.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Silinemedi");
      alert("Gönderi silindi.");
      router.refresh();
    } catch (err) {
      alert("Silme işlemi başarısız oldu.");
    }
  };

  const handleReport = async () => {
    const confirmReport = window.confirm("Bu gönderiyi şikayet etmek istediğinize emin misiniz?");
    if (!confirmReport) return;
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ post_id: postData.id }),
      });
      if (!res.ok) throw new Error("Şikayet başarısız");
      alert("Gönderi şikayet edildi.");
    } catch (err) {
      alert("Şikayet başarısız oldu.");
    }
  };

  const isYouTubeLink = postData.media_url?.includes("youtube.com") ?? false;
  const isOwner = auth?.user?.id === postData.user_id;

  return (
    <div className="p-4 border-y border-gray-300 w-full max-w-full bg-gradient-to-br from-gray-800 to-gray-800 shadow-md rounded-lg text-white relative">
      {showPointAnim && (
        <div className="absolute top-4 right-4 text-green-400 font-bold text-lg animate-bounce">
          +1 Puan!
        </div>
      )}

      <div className="flex gap-4">
        <Link href={`/${postData.username}`}>
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer">
            <Image src={postData.profile_image || "/icons/pp.png"} alt="Avatar" width={100} height={100} />
          </div>
        </Link>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-md font-bold text-white">@{postData.username}</span>
            <div className="relative">
              <button onClick={() => setShowOptions(!showOptions)} className="px-2 py-1 text-white hover:text-orange-500 transition">...</button>
              {showOptions && (
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-300 rounded shadow-md w-32 text-sm z-50">
                  {isOwner ? (
                    <button
                      onClick={handleDelete}
                      className="block w-full text-left px-2 py-1 hover:bg-red-600 transition text-red-500"
                    >
                      Delete
                    </button>
                  ) : (
                    <button
                      onClick={handleReport}
                      className="block w-full text-left px-2 py-1 hover:bg-yellow-500 transition text-yellow-400"
                    >
                      Şikayet Et
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <Link href={`/post/${postData.id}`}>
            <h2 className="text-lg font-bold text-white">{postData.title}</h2>
          </Link>

          <div className="flex flex-wrap text-white">
            {postData.content.split(" ").map((word, index) => (
              <span
                key={index}
                className="relative group cursor-pointer mx-1 inline-block"
                onMouseEnter={() => translateWordWithInput(word, index)}
                onMouseLeave={() => {
                  setHoveredWordIndex(null);
                  setShowInput(false);
                  setUserInput("");
                  setFeedback(null);
                }}
              >
                {word}
                {hoveredWordIndex === index && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs p-3 rounded shadow-lg w-64 min-h-[130px] z-50 flex flex-col justify-start">
                    {completedTranslations.has(index) ? (
                      <div className="text-center text-sm">{feedback || "✅ Bu çeviriyi zaten yaptınız."}</div>
                    ) : (
                      <>
                        <div className="mb-3 w-full h-80 bg-gradient-to-r from-orange-400 to-red-500 text-center text-[11px] flex items-center justify-center rounded">
                          🔥 UnderGo ile İngilizce öğren, puan kazan, seviye atla!
                        </div>
                        <input
                          type="text"
                          className="w-full text-black px-2 py-1 rounded mb-2"
                          placeholder="Çeviriyi yaz..."
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && checkTranslation(index)}
                        />
                        {feedback && <div className="text-center text-sm">{feedback}</div>}
                      </>
                    )}
                  </div>
                )}
              </span>
            ))}
          </div>

          {/* (Medya kısmı değişmedi) */}
          {postData.media_url && (
            <div className="mt-4 max-w-full">
              {isYouTubeLink ? (
                <YouTubeEmbed url={postData.media_url} />
              ) : postData.media_type === "video" ? (
                <video controls className="w-full max-h-[400px] rounded-lg object-contain">
                  <source src={postData.media_url} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={postData.media_url}
                  alt="Post media"
                  width={800}
                  height={600}
                  className="w-full max-h-[400px] rounded-lg object-contain"
                />
              )}
            </div>
          )}

          <span className="text-xs text-white">
            {new Date(postData.created_at).toLocaleString("tr-TR", {
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
        </div>
      </div>
    </div>
  );
}
