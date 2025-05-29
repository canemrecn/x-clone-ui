// src/components/DownloadDmData.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface DownloadDmDataProps {
  otherUserId: number;
  targetDate: string;
}

export default function DownloadDmData({ otherUserId, targetDate }: DownloadDmDataProps) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    try {
      const userId = auth?.user?.id;

      if (!userId) {
        alert("Kullanıcı oturumu bulunamadı.");
        return;
      }

      const res = await fetch("/api/dm-data/fetch", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otherUserId, targetDate }),
      });

      const data = await res.json();

      if (res.ok) {
        const fileName = `dm_messages_${userId}_${otherUserId}_${targetDate}.json`;
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert(data.error || "Veriler alınamadı.");
      }
    } catch (err) {
      console.error("İndirme hatası:", err);
      alert("Veriler indirilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {loading ? "Hazırlanıyor..." : "Mesajları İndir"}
      </button>
    </div>
  );
}
