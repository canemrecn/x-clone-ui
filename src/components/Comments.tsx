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

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/posts/${postId}/comment`);
        if (!res.ok) throw new Error("Yorumlar alınamadı");
        const data = await res.json();
        setComments(data.comments || []);
      } catch (error) {
        console.error("Yorum çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [postId]);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth?.user) {
      alert("Giriş yapmalısınız!");
      return;
    }
    if (!text.trim()) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, text }),
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

  const handleLike = async (commentId: number) => {
    if (!auth?.user) {
      alert("Giriş yapmalısınız!");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/posts/${postId}/comment/${commentId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
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

  const handleReply = async (parentId: number) => {
    if (!auth?.user) {
      alert("Giriş yapmalısınız!");
      return;
    }
    const replyText = prompt("Yanıtınızı yazın:") || "";
    if (!replyText.trim()) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, text: replyText, parent_comment_id: parentId }),
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

  function renderComment(c: CommentData, level = 0) {
    return (
      <div
        key={c.id}
        className="p-3 rounded-lg bg-[#FAFCF2] shadow-md border border-[#BDC4BF] mb-3"
        style={{ marginLeft: level * 20 }}
      >
        <div className="flex items-start gap-3">
          <Link href={`/${c.username}`}>
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#3E6A8A]">
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
              <p className="font-bold text-black">@{c.username}</p>
            </Link>
            <p className="text-black">{c.text}</p>
            <span className="text-xs text-[#BDC4BF]">
              {new Date(c.created_at).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 pl-10 text-sm">
          <button onClick={() => handleLike(c.id)} className="text-[#3E6A8A] hover:underline">
            Like ({c.likes})
          </button>
          <button onClick={() => handleReply(c.id)} className="text-[#A8DBF0] hover:underline">
            Reply
          </button>
        </div>
        {c.replies && c.replies.map((child) => renderComment(child, level + 1))}
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-[#FAFCF2] rounded-lg shadow-md border border-[#BDC4BF]">
      <form onSubmit={handleSubmit} className="flex items-center gap-4 mb-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-black">
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
          className="flex-1 bg-transparent outline-none p-2 text-md border-b border-[#BDC4BF] text-black"
          placeholder={auth?.user ? `@${auth.user.username}, post your reply` : "Post your reply"}
        />
        <button type="submit" className="py-1 px-4 font-bold bg-[#3E6A8A] text-white rounded-full">
          Reply
        </button>
      </form>
      {commentTree.length === 0 ? (
        <p className="text-black">Henüz yorum yok.</p>
      ) : (
        commentTree.map((root) => renderComment(root))
      )}
    </div>
  );
}
