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
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#1e1e2f] via-[#25253a] to-[#2c2c3e] text-white pt-24 pb-20">
      <h1 className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
        📄 KVKK Başvuru Formu
      </h1>
      <p className="text-center text-gray-300 mb-6 text-sm">
        Verilerinizi tamamen silmek için "Ayarlar &gt; Hesabımı Sil" adımını kullanmalısınız.
      </p>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col gap-5 bg-gray-900 p-8 rounded-xl shadow-xl border border-gray-700">
        <input
          type="text"
          value={fullName}
          disabled
          className="w-full p-3 rounded-md bg-gray-800 border border-gray-600 text-white opacity-80 cursor-not-allowed"
        />

        <input
          type="email"
          value={email}
          disabled
          className="w-full p-3 rounded-md bg-gray-800 border border-gray-600 text-white opacity-80 cursor-not-allowed"
        />

        <select
          value={requestType}
          onChange={(e) => setRequestType(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-800 border border-gray-600 text-white"
          required
        >
          <option value="veri-goruntuleme">📊 Verilerimi Görüntüleme</option>
          <option value="veri-aktarimi">🔄 Verilerimi Taşıma</option>
        </select>

        <textarea
          placeholder="📌 Talebinizin detayını yazın..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full p-3 rounded-md bg-gray-800 border border-gray-600 text-white placeholder-gray-400 resize-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-fuchsia-600 hover:to-indigo-600 transition font-semibold disabled:opacity-50"
        >
          {loading ? "Gönderiliyor..." : "🚀 Başvuruyu Gönder"}
        </button>

        {result && (
          <p className={`text-center text-sm font-medium ${result.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>
            {result}
          </p>
        )}
      </form>
    </div>
  );
}
