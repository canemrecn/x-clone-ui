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

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/posts/${postId}/comment`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Yorumlar alınamadı");
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
      setTranslatedWord(data.translation || "Çeviri bulunamadı");
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
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, { ...data.comment, likes: 0 }]);
        setText("");
      }
    } catch (err) {
      console.error("Yorum eklenemedi", err);
    }
  };

  const handleLike = async (id: number) => {
    if (!auth?.user) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comment/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, likes: data.newLikes } : c))
        );
      }
    } catch (err) {
      console.error("Beğeni hatası:", err);
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
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, { ...data.comment, likes: 0 }]);
      }
    } catch (err) {
      console.error("Yanıt eklenemedi", err);
    }
  };

  const commentTree = buildCommentTree();

  const renderComment = (c: CommentData, level = 0) => (
    <div
      key={c.id}
      className="rounded-xl p-4 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-lg mb-4"
      style={{ marginLeft: level * 24 }}
    >
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
          <Link href={`/${c.username}`} className="font-bold text-sm text-white hover:text-cyan-300">@{c.username}</Link>
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
            <button onClick={() => handleLike(c.id)} className="text-cyan-400 hover:underline">
              Beğen ({c.likes})
            </button>
            <button onClick={() => handleReply(c.id)} className="text-yellow-300 hover:underline">
              Yanıtla
            </button>
          </div>
        </div>
      </div>
      {c.replies?.map((child) => renderComment(child, level + 1))}
    </div>
  );

  return (
    <div className="mt-4 p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-600">
      <form onSubmit={handleSubmit} className="flex items-center gap-4 mb-6">
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
          className="flex-1 bg-gray-900 text-white placeholder:text-gray-500 px-3 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder={auth?.user ? `@${auth.user.username}, yorum yap...` : "Yorum yazmak için giriş yap"}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          Gönder
        </button>
      </form>

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
