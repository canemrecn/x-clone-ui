// ✅ src/app/settings/export-data/page.tsx
// ✅ src/app/settings/export-data/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ExportDataPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isClient) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/export-data", {
        method: "GET",
        credentials: "include",
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      alert("Veriler alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2f] via-[#25253a] to-[#2c2c3e] text-white px-6 py-12 pt-24 pb-20">
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 text-center mb-4">
        📁 Verilerimi Dışa Aktar
      </h1>

      <p className="text-center text-sm text-gray-300 mb-10 max-w-xl mx-auto">
        Tüm gönderi, yorum ve profil bilgilerinizi <strong className="text-white">JSON</strong> formatında indirebilirsiniz.
        Bu dosya KVKK ve GDPR kapsamında kişisel veri taşıyabilir.
      </p>

      <div className="flex flex-col items-center gap-5 max-w-md mx-auto bg-gray-900 p-8 rounded-xl border border-gray-700 shadow-lg">
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full py-3 px-6 font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Hazırlanıyor..." : "📥 Verilerimi İndir"}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download="undergo_kisisel_veriler.json"
            className="text-sm text-cyan-400 hover:underline hover:text-cyan-300 transition"
          >
            📄 JSON dosyasını indir
          </a>
        )}
      </div>
    </div>
  );
}
