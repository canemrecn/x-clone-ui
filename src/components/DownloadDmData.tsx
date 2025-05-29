// src/components/DownloadDmData.tsx
// src/components/DownloadDmData.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function DownloadDmData() {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [otherUserId, setOtherUserId] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const handleDownload = async () => {
    setLoading(true);

    try {
      const userId = auth?.user?.id;

      if (!userId || !otherUserId || !targetDate) {
        alert("Lütfen tüm alanları doldurun.");
        return;
      }

      const res = await fetch("/api/dm-data/fetch", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          otherUserId: Number(otherUserId),
          targetDate,
        }),
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
    <div className="p-6 space-y-4 bg-gray-900 rounded-lg shadow-lg max-w-md mx-auto">
      <div>
        <label className="block mb-1 text-sm font-medium text-white">Diğer Kullanıcı ID</label>
        <input
          type="number"
          value={otherUserId}
          onChange={(e) => setOtherUserId(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-600"
          placeholder="örn. 14"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-white">Tarih</label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-600"
        />
      </div>

      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {loading ? "Hazırlanıyor..." : "Mesajları İndir"}
      </button>
    </div>
  );
}
