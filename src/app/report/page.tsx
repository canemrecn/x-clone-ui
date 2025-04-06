//src/app/report/page.tsx
/*Bu dosya, bir gönderiyi şikayet etmek için kullanıcıdan şikayet sebebini alan bir form sunar; URL'den postId parametresini alır, 
kullanıcı formu gönderdiğinde bu postId ve şikayet sebebini /api/report API'sine POST isteği ile gönderir, başarılı olursa ana sayfaya 
yönlendirir, başarısız olursa hata mesajı gösterir.*/
"use client";

import React, { useState, FormEvent, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie"; // Import js-cookie to access cookies

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL'den postId parametresini güvenli şekilde alıyoruz
  const postIdParam = searchParams?.get("postId");
  const postId = postIdParam ? Number(postIdParam) : null;

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formu gönderme işlemi
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setError(null); // Önceki hataları sıfırlıyoruz

    // Boş şikayet sebebine izin vermiyoruz
    if (!reason.trim()) {
      setError("Lütfen geçerli bir şikayet sebebi girin.");
      return;
    }

    if (!postId) {
      setError("Geçersiz postId.");
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get("token"); // Get the token from cookies

      const res = await fetch("/api/report", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`, // Use token in Authorization header
        },
        body: JSON.stringify({ postId, reason }),
      });

      if (res.ok) {
        alert("Şikayetiniz alındı, teşekkürler.");
        router.push("/"); // Ana sayfaya yönlendir
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Şikayet gönderilirken bir hata oluştu.");
      }
    } catch (err: any) {
      setError(err.message || "Şikayet gönderilemedi, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, [reason, postId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md">
        Gönderi Şikayet Et
      </h1>
      {postId ? (
        <>
          <p className="mb-4">
            Şikayet etmek istediğiniz gönderi ID: {postId}
          </p>

          <form onSubmit={handleSubmit} className="mt-4">
            <label className="block mb-2">
              Şikayet Sebebi:
              <textarea
                className="mt-1 block w-full border border-gray-300 p-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white rounded outline-none focus:ring-2 focus:ring-gray-600"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={5}
              />
            </label>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="bg-gradient-to-br from-gray-800 to-gray-700 text-white px-4 py-2 rounded hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition-all"
              disabled={loading}
            >
              {loading ? "Gönderiliyor..." : "Şikayet Et"}
            </button>
          </form>
        </>
      ) : (
        <p className="text-white">
          Geçersiz veya eksik postId parametresi.
        </p>
      )}
    </div>
  );
}
