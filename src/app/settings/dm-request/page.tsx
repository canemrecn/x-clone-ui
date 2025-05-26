//src/app/settings/dm-request/page.tsx
// src/app/settings/dm-request/page.tsx
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
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#2c2c3e] text-white px-6 py-12 pt-24 pb-20">
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 text-center mb-10">
        📄 Özel Mesaj Verisi Talebi
      </h1>

      <div className="max-w-lg mx-auto bg-gray-900 rounded-xl shadow-lg p-6 space-y-6 border border-gray-700">
        <div>
          <label className="block text-sm font-semibold mb-2">Karşı tarafın kullanıcı ID’si</label>
          <input
            type="number"
            value={otherUserId}
            onChange={(e) => setOtherUserId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Tarih (YYYY-MM-DD)</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Gönderiliyor..." : "Veri Talebinde Bulun"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-green-400 bg-gray-800 px-4 py-2 rounded-lg shadow-inner">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
