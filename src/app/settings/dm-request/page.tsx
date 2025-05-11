//src/app/settings/dm-request/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function DmRequestPage() {
  const auth = useAuth();
  const [otherUserId, setOtherUserId] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (auth.loading) {
    return <div className="p-6 text-white">Yükleniyor...</div>;
  }

  const handleSubmit = async () => {
    if (!auth.user || !auth.user.id || !auth.user.email) {
      setMessage("Kullanıcı oturumu bulunamadı.");
      return;
    }

    if (!otherUserId || !targetDate) {
      setMessage("Tüm alanlar zorunludur.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/dm-data-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: auth.user.id,
          otherUserId,
          targetDate,
          email: auth.user.email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("📩 Talebiniz alındı. Veriler e-posta adresinize gönderilecek.");
        setOtherUserId("");
        setTargetDate("");
      } else {
        setMessage(data.error || "Bir hata oluştu.");
      }
    } catch (error) {
      setMessage("Sunucu hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-800 to-gray-700 text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Özel Mesaj Verisi Talebi</h1>

      <div className="max-w-md mx-auto flex flex-col gap-4">
        <div>
          <label className="block mb-1">Karşı tarafın kullanıcı ID’si</label>
          <input
            type="number"
            value={otherUserId}
            onChange={(e) => setOtherUserId(e.target.value)}
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
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          {loading ? "Gönderiliyor..." : "Veri Talebinde Bulun"}
        </button>

        {message && <p className="mt-2 text-sm text-center text-green-300">{message}</p>}
      </div>
    </div>
  );
}
