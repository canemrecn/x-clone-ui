// src/components/Comments.tsx
/*Bu dosya, bir gönderiye ait yorumları listeleyen, kullanıcıların yorum yapmasına, yorumlara yanıt vermesine, yorumları beğenmesine ve 
yorumlardaki kelimeler üzerine gelindiğinde anlık çeviri yapılmasına olanak tanıyan interaktif bir Comments bileşeni sunar; ayrıca 
yorumlar hiyerarşik (ağaç yapısında) olarak gösterilir ve tüm işlemler HTTP‑only çerezlerle (token HTTP‑only cookie üzerinden sağlanır) 
yapılır.*/
"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type CommentData = {
  id: number;
  post_id: number;
  user_id: number;
  text: string;
  created_at: string;
  username: string;
  profile_image?: string;
  likes: number;
  parent_comment_id?: number | null;
  is_deleted: boolean;
  replies?: CommentData[];
};

interface CommentsProps {
  postId: number;
}

export default function Comments({ postId }: CommentsProps) {
  const auth = useAuth();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [translatedWord, setTranslatedWord] = useState<string | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);
  const [showOptionsId, setShowOptionsId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/posts/${postId}/comment`, {
          credentials: "include",
        });
        const data = await res.json();
        const activeComments = data.comments.filter((c: CommentData) => !c.is_deleted);
        setComments(activeComments || []);
      } catch (error) {
        console.error("Yorum çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [postId]);

  const buildCommentTree = (): CommentData[] => {
    const childrenMap: Record<number, CommentData[]> = {};
    comments.forEach((c) => {
      if (c.parent_comment_id) {
        if (!childrenMap[c.parent_comment_id]) {
          childrenMap[c.parent_comment_id] = [];
        }
        childrenMap[c.parent_comment_id].push(c);
      }
    });
    const attachReplies = (c: CommentData): CommentData => ({
      ...c,
      replies: (childrenMap[c.id] || []).map(attachReplies),
    });
    return comments.filter((c) => !c.parent_comment_id).map(attachReplies);
  };

  const translateWord = async (word: string) => {
    setHoveredWord(word);
    setTranslatedWord(null);
    setLoadingTranslation(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, targetLang: "tr" }),
      });
      const data = await res.json();
      setTranslatedWord(data.translation || "Çeviri yok");
    } catch {
      setTranslatedWord("Hata");
    } finally {
      setLoadingTranslation(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth?.user || !text.trim()) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setComments((prev) => [...prev, { ...data.comment, likes: 0 }]);
      setText("");
    } catch (err) {
      console.error("Yorum eklenemedi", err);
    }
  };

  const handleDelete = async (commentId: number) => {
  const confirmDelete = window.confirm("Yorumu silmek istediğinize emin misiniz?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`/api/posts/${postId}/comment/${commentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Yorum silinemedi.");
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  } catch (err) {
    console.error("Silme hatası:", err);
    alert("Sunucu hatası: Yorum silinemedi.");
  }
};


  const handleReport = async (commentId: number) => {
  if (!auth?.user) {
    alert("Şikayet edebilmek için giriş yapmalısınız.");
    return;
  }

  const confirmReport = window.confirm("Bu yorumu şikayet etmek istediğinize emin misiniz?");
  if (!confirmReport) return;

  try {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        comment_id: commentId,
        reason: "Uygunsuz yorum",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Şikayet başarısız.");
    }

    alert("Yorum şikayet edildi.");
  } catch (err: any) {
    console.error("Şikayet hatası:", err);
    alert("Şikayet başarısız oldu: " + err.message);
  }
};


  const handleReply = async (parentId: number) => {
    if (!auth?.user) return;
    const reply = prompt("Yanıtınızı girin:");
    if (!reply?.trim()) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: reply, parent_comment_id: parentId }),
      });
      const data = await res.json();
      setComments((prev) => [...prev, { ...data.comment, likes: 0 }]);
    } catch (err) {
      console.error("Yanıt eklenemedi", err);
    }
  };

  const commentTree = buildCommentTree();

  const renderComment = (c: CommentData, level = 0) => {
  const isOwner = auth?.user?.id === c.user_id;

  return (
    <div key={c.id} className="relative mb-4">
      {level > 0 && (
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-700" />
      )}

      <div className="rounded-xl p-4 pl-6 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-lg">
        <div className="flex gap-4">
          <Link href={`/${c.username}`}>
            <Image
              src={c.profile_image || "/icons/pp.png"}
              alt={c.username}
              width={40}
              height={40}
              className="rounded-full border-2 border-gray-600"
            />
          </Link>

          <div className="w-full">
            <div className="flex justify-between items-center">
              <Link href={`/${c.username}`} className="font-bold text-sm text-white hover:text-cyan-300">
                @{c.username}
              </Link>
              <div className="relative">
                <button
                  onClick={() =>
                    setShowOptionsId((prev) => (prev === c.id ? null : c.id))
                  }
                  className="px-2 py-1 text-gray-400 hover:text-orange-400 text-xl"
                >
                  ⋯
                </button>
                {showOptionsId === c.id && (
                  <div className="absolute right-0 mt-2 bg-gray-900 border border-gray-700 rounded shadow-lg z-50 w-32">
                    {isOwner ? (
                      <button
                        onClick={() => {
                          handleDelete(c.id);
                          setShowOptionsId(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-600 hover:text-white text-sm"
                      >
                        Sil
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleReport(c.id);
                          setShowOptionsId(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-yellow-400 hover:bg-yellow-600 hover:text-black text-sm"
                      >
                        Şikayet Et
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-white mt-1">
              {c.text.split(" ").map((word, index) => (
                <span
                  key={index}
                  className="inline-block mx-1 relative cursor-pointer group"
                  onMouseEnter={() => translateWord(word)}
                  onMouseLeave={() => {
                    setHoveredWord(null);
                    setTranslatedWord(null);
                  }}
                >
                  {word}
                  {hoveredWord === word && (
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded shadow z-50">
                      {loadingTranslation ? "..." : translatedWord}
                    </span>
                  )}
                </span>
              ))}
            </p>

            <div className="mt-2 text-xs text-gray-400">
              {new Date(c.created_at).toLocaleString()}
            </div>

            <div className="flex gap-4 text-xs mt-2">
              <button onClick={() => handleReply(c.id)} className="text-yellow-300 hover:underline">Yanıtla</button>
            </div>
          </div>
        </div>
      </div>

      {c.replies?.map((child) => renderComment(child, level + 1))}
    </div>
  );
};




  return (
  <div className="mt-4 p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-600">
    {/* Yorum yazma formu */}
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6"
    >
      <div className="flex items-center gap-3 flex-1">
        <Image
          src={auth?.user?.profile_image || "/icons/pp.png"}
          alt="Avatar"
          width={40}
          height={40}
          className="rounded-full border border-gray-500"
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 w-full bg-gray-900 text-white placeholder:text-gray-500 px-3 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder={
            auth?.user
              ? `@${auth.user.username}, yorum yap...`
              : "Yorum yazmak için giriş yap"
          }
        />
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition disabled:opacity-50"
      >
        Gönder
      </button>
    </form>

    {/* Yorum listesi */}
    {loading ? (
      <p className="text-gray-300">Yükleniyor...</p>
    ) : commentTree.length === 0 ? (
      <p className="text-gray-400">Henüz yorum yok.</p>
    ) : (
      commentTree.map((comment) => renderComment(comment))
    )}
  </div>
);

}
