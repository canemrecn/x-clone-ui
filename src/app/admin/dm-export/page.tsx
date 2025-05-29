//src/app/admin/dm-export/page.tsx
"use client";

import { useState } from "react";

export default function AdminDmExportPage() {
  const [userId1, setUserId1] = useState("");
  const [userId2, setUserId2] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [message, setMessage] = useState("");

  const handleExport = async () => {
    if (!userId1 || !userId2 || !targetDate) {
      setMessage("Tüm alanları doldurmanız gerekiyor.");
      return;
    }

    setMessage("İşleniyor...");

    try {
      const res = await fetch("/api/admin/dm-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId1: parseInt(userId1),
          userId2: parseInt(userId2),
          targetDate,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || "Sunucu hatası.");
        return;
      }

      if (typeof window === "undefined" || typeof document === "undefined") {
        setMessage("Bu özellik tarayıcıda çalıştırılmalıdır.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dm_${userId1}_${userId2}_${targetDate}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage("✅ JSON dosyası indirildi.");
    } catch (error) {
      console.error("İndirme hatası:", error);
      setMessage("Veri çekme sırasında hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-800 to-gray-700 text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">📩 DM Mesaj Verisi İndir (Admin)</h1>

      <div className="max-w-md mx-auto flex flex-col gap-4">
        <div>
          <label className="block mb-1">Kullanıcı ID 1</label>
          <input
            type="number"
            value={userId1}
            onChange={(e) => setUserId1(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-1">Kullanıcı ID 2</label>
          <input
            type="number"
            value={userId2}
            onChange={(e) => setUserId2(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-1">Tarih (YYYY-MM-DD)</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          />
        </div>

        <button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Veriyi JSON Olarak İndir
        </button>

        {message && <p className="mt-2 text-sm text-center text-green-300">{message}</p>}
      </div>
    </div>
  );
}
