// src/app/admin/pending/page.tsx
"use client";

import { useEffect, useState } from "react";

interface PendingPost {
  id: number;
  user_id: number;
  username: string;
  full_name: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
}

export default function PendingPostsPage() {
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPending() {
      try {
        const res = await fetch("/api/posts/pending", {
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Veri çekilemedi");
        }
        const data = await res.json();
        setPendingPosts(data.posts);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchPending();
  }, []);

  async function handleApprove(id: number) {
    const res = await fetch("/api/posts/approve", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: id }),
    });
    if (res.ok) {
      setPendingPosts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function handleReject(id: number) {
    const res = await fetch("/api/posts/reject", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: id }),
    });
    if (res.ok) {
      setPendingPosts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Tarafından Engellenen Gönderiler</h1>
      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : pendingPosts.length === 0 ? (
        <p className="text-center">Bekleyen gönderi yok.</p>
      ) : (
        <table className="w-full border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-2 text-left">Kullanıcı</th>
              <th className="p-2 text-left">İçerik</th>
              <th className="p-2 text-left">Tarih</th>
              <th className="p-2">Medya</th>
              <th className="p-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {pendingPosts.map((post) => (
              <tr key={post.id} className="border-t border-gray-700">
                <td className="p-2">
                  {post.full_name} <span className="text-gray-400">@{post.username}</span>
                </td>
                <td className="p-2 whitespace-pre-wrap max-w-xs overflow-hidden">
                  {post.content}
                </td>
                <td className="p-2">
                  {new Date(post.created_at).toLocaleString()}
                </td>
                <td className="p-2">
                  {post.media_url && (
                    post.media_type?.includes("video") ? (
                      <video
                        src={post.media_url}
                        controls
                        className="max-w-[180px] max-h-[140px] rounded shadow"
                      />
                    ) : (
                      <img
                        src={post.media_url}
                        alt="media"
                        className="max-w-[180px] max-h-[140px] object-cover rounded shadow"
                      />
                    )
                  )}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded mr-2"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => handleReject(post.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                  >
                    Reddet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
