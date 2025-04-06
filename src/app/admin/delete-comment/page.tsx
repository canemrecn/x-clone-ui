// src/app/admin/delete-comment/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCommentPage() {
  const [commentId, setCommentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [commentData, setCommentData] = useState<any | null>(null);
  const router = useRouter();

  const handleShow = async () => {
    if (!commentId) {
      setError("Lütfen bir yorum ID'si girin.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/get-comment?commentId=${commentId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        setCommentData(null);
        setSuccessMessage(null);
      } else {
        setCommentData(data.comment);
        setError(null);
      }
    } catch (err: any) {
      setError("Bir hata oluştu.");
      setSuccessMessage(null);
    }
  };

  const handleDelete = async () => {
    if (!commentId) {
      setError("Lütfen bir yorum ID'si girin.");
      return;
    }

    try {
      const res = await fetch("/api/admin/delete-comment", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        setSuccessMessage(null);
      } else {
        setSuccessMessage("Yorum başarıyla silindi.");
        setError(null);
        setCommentId(""); // Arama kutusunu temizle
        setCommentData(null);
        router.push("/admin/comments");
      }
    } catch (err: any) {
      setError("Bir hata oluştu.");
      setSuccessMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Yorum Göster / Sil</h1>

      <div className="mb-4">
        <input
          type="text"
          value={commentId}
          onChange={(e) => setCommentId(e.target.value)}
          placeholder="Yorum ID girin"
          className="p-2 w-full rounded bg-gray-800 text-white border border-gray-700"
        />
      </div>

      <button
        onClick={handleShow}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mr-4"
      >
        Yorumu Göster
      </button>

      <button
        onClick={handleDelete}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
      >
        Yorum Sil
      </button>

      {error && <p className="text-red-400 text-center mt-4">{error}</p>}
      {successMessage && <p className="text-green-400 text-center mt-4">{successMessage}</p>}

      {commentData && (
        <div className="mt-6">
          <h2 className="text-lg font-bold">Yorum Bilgileri</h2>
          <p><strong>Yorum ID:</strong> {commentData.id}</p>
          <p><strong>Yorum:</strong> {commentData.text}</p>
          <p><strong>Gönderi ID:</strong> {commentData.post_id}</p>
          <p><strong>Yorumun Silinme Durumu:</strong> {commentData.is_deleted ? "Silindi" : "Aktif"}</p>
        </div>
      )}
    </div>
  );
}
