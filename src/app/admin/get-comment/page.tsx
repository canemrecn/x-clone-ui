// src/app/admin/get-comment/page.tsx
"use client";
import { useState, useEffect } from "react";

export default function GetCommentPage() {
  const [commentData, setCommentData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommentData = async () => {
      // Yorum ID'sini URL'den alıyoruz
      const commentId = new URLSearchParams(window.location.search).get("commentId");

      // Yorum ID'si eksikse, hata mesajı gösteriyoruz
      if (!commentId) {
        setError("Yorum ID'si eksik.");
        return;
      }

      try {
        // Yorum verisini API'den alıyoruz
        const response = await fetch(`/api/admin/get-comment?commentId=${commentId}`);
        const data = await response.json();

        console.log("API Response:", data); // API cevabını kontrol et

        if (!response.ok) {
          setError(data.message || "Bir hata oluştu.");
        } else {
          setCommentData(data.comment); // Yorum verisini state'e atıyoruz
        }
      } catch (error: unknown) {
        console.error(error);  // Hata konsola yazdırılıyor
        if (error instanceof Error) {
          setError("Bir hata oluştu: " + error.message);
        } else {
          setError("Bilinmeyen bir hata oluştu.");
        }
      }
    };

    fetchCommentData();
  }, []); // Yalnızca sayfa yüklendiğinde çalışacak şekilde

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Yorum Bilgisi</h1>

      {error && <p className="text-red-400 text-center">{error}</p>}

      {commentData ? (
        <div className="mt-6">
          <h2 className="text-lg font-bold">Yorum Bilgileri</h2>
          <p><strong>Yorum ID:</strong> {commentData.id}</p>
          <p><strong>Yorum:</strong> {commentData.text}</p>
          <p><strong>Gönderi ID:</strong> {commentData.post_id}</p>
          <p><strong>Yorumun Silinme Durumu:</strong> {commentData.is_deleted ? "Silindi" : "Aktif"}</p>
        </div>
      ) : (
        <p className="text-center">Yorum verisi yükleniyor...</p>
      )}
    </div>
  );
}
