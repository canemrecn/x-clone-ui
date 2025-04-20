// ✅ src/app/settings/export-data/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ExportDataPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ useAuth dahil tüm hook'lar dışarıda çağrılmalı
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isClient) return null; // ✅ Hook'lar yukarıda çağrıldığı için güvenli

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
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-800 to-gray-700 text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Verilerimi Dışa Aktar</h1>
      <p className="mb-4 text-center">Tüm gönderi, yorum ve profil bilgilerini JSON dosyası olarak indir.</p>
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleExport}
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold shadow"
        >
          {loading ? "Hazırlanıyor..." : "Verilerimi İndir"}
        </button>
        {downloadUrl && (
          <a
            href={downloadUrl}
            download="undergo_kisisel_veriler.json"
            className="underline text-blue-300 hover:text-blue-200"
          >
            JSON dosyasını indir
          </a>
        )}
      </div>
    </div>
  );
}
