// src/components/DownloadDmData.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function DownloadDmData() {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    try {
      const userId = auth?.user?.id;
      const otherUserId = 14;
      const targetDate = "2025-04-19";

      if (!userId) {
        alert("Kullanıcı oturumu bulunamadı.");
        return;
      }

      const res = await fetch("/api/dm-data/fetch", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          otherUserId,
          targetDate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `dm_messages_${userId}_${otherUserId}_${targetDate}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(data.error || "Veriler alınamadı.");
      }
    } catch (err) {
      alert("Veriler indirilemedi.");
      console.error(err);
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
