"use client";

import React, { useState, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // "searchParams" tipik olarak null dönebiliyor ama TS uyarı verebiliyor
  // Aşağıda "!" ile TS'ye null olmadığını söylüyoruz.
  const postIdParam = searchParams!.get("postId");
  const postId = postIdParam ? Number(postIdParam) : null;

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!postId) {
      alert("Geçersiz postId");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, reason }),
      });
      if (res.ok) {
        alert("Şikayetiniz alındı, teşekkürler.");
        router.push("/");
      } else {
        alert("Şikayet gönderilirken hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Şikayet gönderilemedi, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

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
