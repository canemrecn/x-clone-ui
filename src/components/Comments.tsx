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
  is_deleted: boolean; // 'is_deleted' ekledik
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

  // Çeviri ile ilgili state'ler
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [translatedWord, setTranslatedWord] = useState<string | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/posts/${postId}/comment`, {
          credentials: "include", // Send cookies with request
        });
        if (!res.ok) throw new Error("Yorumlar alınamadı");
        const data = await res.json();
        
        // Silinmiş yorumları filtreleyerek sadece aktif yorumları al
        const activeComments = data.comments.filter((comment: CommentData) => !comment.is_deleted);
        setComments(activeComments || []);
      } catch (error) {
        console.error("Yorum çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [postId]);

  // Yorumları ağaç yapısına çevirme fonksiyonu
  function buildCommentTree(): CommentData[] {
    const childrenMap: Record<number, CommentData[]> = {};
    comments.forEach((c) => {
      if (c.parent_comment_id) {
        if (!childrenMap[c.parent_comment_id]) {
          childrenMap[c.parent_comment_id] = [];
        }
        childrenMap[c.parent_comment_id].push(c);
      }
    });
    function attachReplies(comment: CommentData): CommentData {
      const childArray = childrenMap[comment.id] || [];
      return { ...comment, replies: childArray.map((child) => attachReplies(child)) };
    }
    const rootComments = comments.filter((c) => !c.parent_comment_id);
    return rootComments.map((root) => attachReplies(root));
  }

  // Kelime çeviri fonksiyonu
  const translateWord = async (word: string) => {
    setHoveredWord(word);
    setTranslatedWord(null);
    setLoadingTranslation(true);

    try {
      const targetLang = "tr"; // Assuming 'tr' as default target language (can be dynamically set later)
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies with request
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

  // Yorum ekleme işlemi
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth?.user) {
      alert("Giriş yapmalısınız!");
      return;
    }
    if (!text.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies with request
        body: JSON.stringify({ text }), // No need for token in the body, it is managed via HTTP-only cookie
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, { ...data.comment, likes: 0 }]);
        setText("");
      } else {
        alert("Yorum eklenirken hata oluştu.");
      }
    } catch (error) {
      console.error("Yorum ekleme hatası:", error);
    }
  };

  // Yorum beğenme işlemi
  const handleLike = async (commentId: number) => {
    if (!auth?.user) {
      alert("Giriş yapmalısınız!");
      return;
    }
    try {
      const res = await fetch(`/api/posts/${postId}/comment/${commentId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies with request
        body: JSON.stringify({}), // No need for token in the body, it is managed via HTTP-only cookie
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, likes: data.newLikes } : c))
        );
      }
    } catch (error) {
      console.error("Beğeni hatası:", error);
    }
  };

  // Yanıt ekleme işlemi
  const handleReply = async (parentId: number) => {
    if (!auth?.user) {
      alert("Giriş yapmalısınız!");
      return;
    }
    const replyText = prompt("Yanıtınızı yazın:") || "";
    if (!replyText.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies with request
        body: JSON.stringify({ text: replyText, parent_comment_id: parentId }), // No need for token in the body, it is managed via HTTP-only cookie
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, { ...data.comment, likes: 0 }]);
      }
    } catch (error) {
      console.error("Yanıt ekleme hatası:", error);
    }
  };

  const commentTree = buildCommentTree();

  // Yorum içeriğini kelimelere ayırarak çeviri özelliği ekleyen render fonksiyonu
  function renderComment(c: CommentData, level = 0) {
    return (
      <div
        key={c.id}
        className="p-3 rounded-lg bg-gradient-to-br from-gray-800 to-gray-800 shadow-md border border-gray-300 mb-3"
        style={{ marginLeft: level * 20 }}
      >
        <div className="flex items-start gap-3">
          <Link href={`/${c.username}`}>
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
              <Image
                src={c.profile_image || "/icons/pp.png"}
                alt={c.username}
                width={40}
                height={40}
              />
            </div>
          </Link>
          <div>
            <Link href={`/${c.username}`}>
              <p className="font-bold text-white">@{c.username}</p>
            </Link>
            <p className="text-white">
              {c.text.split(" ").map((word, index) => (
                <span
                  key={index}
                  className="relative group cursor-pointer mx-1 inline-block"
                  onMouseEnter={() => translateWord(word)}
                  onMouseLeave={() => {
                    setHoveredWord(null);
                    setTranslatedWord(null);
                  }}
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
            <span className="text-xs text-white">
              {new Date(c.created_at).toLocaleString()}
            </span>
            <p className="text-xs text-gray-300">Yorum ID: {c.id}</p> {/* Yorum ID bilgisi ekleniyor */}
          </div>
        </div>
        <div className="flex items-center gap-4 pl-10 text-sm">
          <button
            onClick={() => handleLike(c.id)}
            className="text-white hover:underline hover:text-gray-300"
          >
            Like ({c.likes})
          </button>
          <button
            onClick={() => handleReply(c.id)}
            className="text-white hover:underline hover:text-gray-300"
          >
            Reply
          </button>
        </div>
        {c.replies && c.replies.map((child) => renderComment(child, level + 1))}
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gradient-to-br from-gray-800 to-gray-800 rounded-lg shadow-md border border-gray-300">
      <form onSubmit={handleSubmit} className="flex items-center gap-4 mb-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
          <Image
            src={auth?.user?.profile_image || "/icons/pp.png"}
            alt="Avatar"
            width={40}
            height={40}
          />
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-gradient-to-br from-gray-800 to-gray-800 outline-none p-2 text-md border-b border-gray-300 text-white"
          placeholder={auth?.user ? `@${auth.user.username}, yorumunuzu yazın` : "Yorumunuzu yazın"}
        />
        <button
          type="submit"
          className="py-1 px-4 font-bold bg-gradient-to-br from-gray-800 to-gray-800 text-white rounded-full hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-700 transition"
        >
          Reply
        </button>
      </form>
      {loading ? (
        <p className="text-white">Yorumlar yükleniyor...</p>
      ) : commentTree.length === 0 ? (
        <p className="text-white">Henüz yorum yok.</p>
      ) : (
        commentTree.map((root) => renderComment(root))
      )}
    </div>
  );
}
