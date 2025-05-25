// src/components/Post.tsx

"use client";

/*
Bu dosya, bir sosyal medya gönderisini detaylı şekilde görüntüleyen Post bileşenini içerir; kullanıcı adı, profil fotoğrafı, gönderi 
metni (kelime çeviri özelliğiyle), medya içeriği (resim, video veya YouTube bağlantısı), dil bayrağı, oluşturulma tarihi ve etkileşimler 
(beğeni, yorum sayısı, detay sayfasına link) gibi bilgileri gösterir. Ayrıca kullanıcı yetkiliyse gönderiyi silebilir, herhangi bir 
kullanıcı gönderiyi raporlayabilir veya doğrudan mesaj yoluyla paylaşabilir. Medya dosyasının detayları gerekiyorsa sunucudan alınır 
ve mobil/masaüstü uyumlu şekilde dinamik render edilir.
*/

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
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [correctTranslation, setCorrectTranslation] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showPointAnim, setShowPointAnim] = useState(false);
  const [translatedWords, setTranslatedWords] = useState<Record<number, boolean>>({});
  const [showOptions, setShowOptions] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  const translateWordWithInput = async (word: string, index: number) => {
    setActiveWordIndex(index);
    setCorrectTranslation(null);
    setUserInput("");
    setFeedback(null);

    try {
      // İlk olarak daha önce bu kelime bu konumda çevrilmiş mi kontrol et
      const resCheck = await fetch(
        `/api/check-translation?postId=${postData.id}&word=${encodeURIComponent(`${word}_${index}`)}`,
        { credentials: "include" }
      );
      const dataCheck = await resCheck.json();

      if (dataCheck.alreadyTranslated) {
        setFeedback("✅ Bu kelimeyi zaten çevirdiniz.");
        return;
      }

      // Çeviri al
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

  const checkTranslation = async (word: string, index: number) => {
    if (userInput.trim().toLowerCase() === correctTranslation?.toLowerCase()) {
      setFeedback("✅ Doğru! +1 puan");
      setShowPointAnim(true);

      try {
        await fetch("/api/check-translation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            postId: postData.id,
            word: `${word}_${index}`, // ✅ Konumla birlikte kaydet
          }),
        });

        // O kelime artık çevrildi olarak işaretleniyor
        setTranslatedWords((prev) => ({ ...prev, [index]: true }));
      } catch (error) {
        console.error("Puan ekleme hatası:", error);
      }

      setTimeout(() => setShowPointAnim(false), 1500);
    } else {
      setFeedback(`❌ Yanlış. Doğru: ${correctTranslation}`);
    }

    setTimeout(() => {
      setActiveWordIndex(null);
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
    <div className="p-5 mb-4 border border-gray-700 w-full bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-lg rounded-xl text-white relative transition-all">
  {showPointAnim && (
    <div className="absolute top-4 right-4 text-green-400 font-bold text-lg animate-bounce">
      +1 Puan!
    </div>
  )}

  <div className="flex gap-4">
    <Link href={`/${postData.username}`}>
      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-500 hover:scale-105 transition-all cursor-pointer">
        <Image src={postData.profile_image || "/icons/pp.png"} alt="Avatar" width={100} height={100} />
      </div>
    </Link>

    <div className="flex-1 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-base font-semibold text-gray-200">@{postData.username}</span>
        <div className="relative">
          <button onClick={() => setShowOptions(!showOptions)} className="px-3 py-1 text-gray-300 hover:text-orange-400 transition-all text-xl">⋯</button>
          {showOptions && (
            <div className="absolute right-0 top-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-md w-36 text-sm z-50">
              {isOwner ? (
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 hover:bg-red-600 hover:text-white transition-all text-red-400"
                >
                  Delete
                </button>
              ) : (
                <button
                  onClick={handleReport}
                  className="block w-full text-left px-4 py-2 hover:bg-yellow-500 hover:text-black transition-all text-yellow-400"
                >
                  Şikayet Et
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Link href={`/post/${postData.id}`}>
        <h2 className="text-lg font-bold text-white hover:text-orange-400 transition">{postData.title}</h2>
      </Link>

      <div className="flex flex-wrap text-gray-100 leading-relaxed tracking-wide">
        {postData.content.split(" ").map((word, index) => (
          <span
            key={index}
            className="relative group cursor-pointer mx-1 inline-block"
            onMouseEnter={() => translateWordWithInput(word, index)}
            onMouseLeave={() => {
              setActiveWordIndex(null);
              setUserInput("");
              setFeedback(null);
            }}
          >
            {word}
            {activeWordIndex === index && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs p-3 rounded-xl shadow-xl w-64 min-h-[130px] z-50 flex flex-col justify-start border border-gray-700">
                <div className="mb-3 w-full h-20 bg-gradient-to-r from-orange-500 to-pink-500 text-center text-[11px] flex items-center justify-center rounded-md font-semibold shadow-inner">
                  🔥 UnderGo ile İngilizce öğren, puan kazan, seviye atla!
                </div>

                {translatedWords[index] ? (
                  <div className="text-center text-green-400 text-sm font-medium">✅ Bu kelimeyi zaten çevirdiniz.</div>
                ) : correctTranslation ? (
                  <>
                    <input
                      type="text"
                      className="w-full text-black px-2 py-1 rounded-md mb-2 border border-gray-300 focus:outline-none"
                      placeholder="Çeviriyi yaz..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && checkTranslation(word, index)}
                    />
                    {feedback && <div className="text-center text-sm">{feedback}</div>}
                  </>
                ) : (
                  <div className="text-center text-sm text-gray-400">Yükleniyor...</div>
                )}
              </div>
            )}
          </span>
        ))}
      </div>

      {postData.media_url && (
        <div className="mt-4 max-w-full">
          {isYouTubeLink ? (
            <YouTubeEmbed url={postData.media_url} />
          ) : postData.media_type === "video" ? (
            <video controls className="w-full max-h-[400px] rounded-lg object-contain shadow-lg">
              <source src={postData.media_url} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={postData.media_url}
              alt="Post media"
              width={800}
              height={600}
              className="w-full max-h-[400px] rounded-lg object-contain shadow-lg"
            />
          )}
        </div>
      )}

      {postData.lang && (
        <div className="flex items-center gap-2 text-xs text-gray-300 italic mt-2">
          <Image
            src={postData.lang === "en" ? "/icons/united-kingdom.png" : "/icons/turkey.png"}
            alt={postData.lang}
            width={25}
            height={25}
          />
        </div>
      )}

      <span className="text-xs text-gray-400 mt-1">
        {new Date(postData.created_at).toLocaleString("tr-TR", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </span>

      <p className="text-xs text-gray-500 mt-2">Gönderi ID: {postData.id}</p>

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
