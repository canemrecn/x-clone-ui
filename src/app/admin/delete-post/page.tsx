// src/app/admin/delete-post/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeletePostPage() {
  const [postId, setPostId] = useState("");
  const [post, setPost] = useState<any | null>(null);  // Gönderi bilgisini saklamak için state
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const fetchPost = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/get-post?postId=${id}`);
      const data = await res.json();
      if (res.ok) {
        setPost(data.post);  // Gönderiyi state'e kaydet
        setError(null);       // Hata varsa sıfırlanır
      } else {
        setPost(null);
        setError(data.message);  // Hata mesajını göster
      }
    } catch (err: any) {
      setError("Bir hata oluştu");
      setPost(null);
    }
  };

  const handleDelete = async () => {
    if (!postId) {
      setError("Lütfen bir gönderi ID'si girin.");
      return;
    }

    try {
      const res = await fetch("/api/admin/delete-post", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        setSuccessMessage(null);
      } else {
        setSuccessMessage("Gönderi başarıyla silindi.");
        setError(null);
        setPostId(""); // Arama kutusunu temizle
        setPost(null);  // Gönderi bilgisini sıfırla
        router.push("/admin/posts");  // Yönlendirme
      }
    } catch (err: any) {
      setError("Bir hata oluştu.");
      setSuccessMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Gönderi Silme</h1>

      <div className="mb-4">
        <input
          type="text"
          value={postId}
          onChange={(e) => {
            setPostId(e.target.value);
            setPost(null); // Yeni ID girildiğinde eski gönderiyi sıfırla
          }}
          placeholder="Gönderi ID girin"
          className="p-2 w-full rounded bg-gray-800 text-white border border-gray-700"
        />
        <button
          onClick={() => fetchPost(postId)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mt-2"
        >
          Gönderiyi Göster
        </button>
      </div>

      {/* Eğer bir gönderi bulunduysa, gönderi bilgilerini göster */}
      {post && (
        <div className="mb-6">
          <h2 className="text-2xl mb-2">Gönderi Bilgisi</h2>
          <p><strong>Başlık:</strong> {post.title}</p>
          <p><strong>İçerik:</strong> {post.content}</p>
          {post.media_url && (
            <p>
              <strong>Medya:</strong>
              <img src={post.media_url} alt="Post Medyası" className="w-full mt-2" />
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleDelete}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
      >
        Gönderiyi Sil
      </button>

      {error && <p className="text-red-400 text-center mt-4">{error}</p>}
      {successMessage && <p className="text-green-400 text-center mt-4">{successMessage}</p>}
    </div>
  );
}
