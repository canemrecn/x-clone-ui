// ✅ src/app/settings/kvkk-request/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function KvkkRequestPage() {
  const auth = useAuth();

  const fullName = `${auth?.user?.full_name || ""} ${auth?.user?.username || ""}`;
  const email = auth?.user?.email || "";

  const [requestType, setRequestType] = useState("veri-goruntuleme");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/privacy-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          requestType,
          description: message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult("❌ Hata: " + data.error);
      } else {
        setResult("✅ Başvurunuz başarıyla alındı.");
        setRequestType("veri-goruntuleme");
        setMessage("");
      }
    } catch (err) {
      console.error("KVKK başvuru hatası:", err);
      setResult("❌ Sunucu hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-800 to-gray-700 text-white">
      <h1 className="text-2xl font-bold mb-4 text-center">KVKK Başvuru Formu</h1>
      <p>Verilerinizi silmek için ayarlar sayfasına dönüp hesabımı sil seçeneğinden işlem yapmanız gerekmektedir</p>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col gap-4 bg-gray-800 p-6 rounded-xl shadow-lg">
        <input
          type="text"
          value={fullName}
          disabled
          className="p-3 rounded-md bg-gray-700 text-white placeholder-gray-300 opacity-70 cursor-not-allowed"
        />

        <input
          type="email"
          value={email}
          disabled
          className="p-3 rounded-md bg-gray-700 text-white placeholder-gray-300 opacity-70 cursor-not-allowed"
        />

        <select
          value={requestType}
          onChange={(e) => setRequestType(e.target.value)}
          className="p-3 rounded-md bg-gray-700 text-white"
          required
        >
          <option value="veri-goruntuleme">Verilerimi Görüntüleme</option>
          <option value="veri-aktarimi">Verilerimi Taşıma</option>
        </select>

        <textarea
          placeholder="Talebinizin detayını yazın..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="p-3 rounded-md bg-gray-700 text-white placeholder-gray-300"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md font-semibold transition"
        >
          {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
        </button>

        {result && <p className="text-center text-sm">{result}</p>}
      </form>
    </div>
  );
}