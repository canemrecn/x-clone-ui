// src/app/settings/kvkk-history/page.tsx
"use client";

import { useEffect, useState } from "react";

type KvkkRequest = {
  id: number;
  request_type: string;
  description: string;
  created_at: string;
  status?: string;
};

export default function KvkkHistoryPage() {
  const [requests, setRequests] = useState<KvkkRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/privacy-request/history", {
        credentials: "include",
      });
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Veri alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#1e1e2f] via-[#25253a] to-[#2c2c3e] text-white pt-24 pb-20">
      <h1 className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-10">
        📜 KVKK Başvuru Geçmişi
      </h1>

      {loading ? (
        <p className="text-center text-gray-300">Yükleniyor...</p>
      ) : requests.length === 0 ? (
        <p className="text-center text-gray-400">Henüz başvuru yapılmamış.</p>
      ) : (
        <ul className="space-y-6 max-w-3xl mx-auto">
          {requests.map((req) => (
            <li
              key={req.id}
              className="p-5 rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-xl transition-all"
            >
              <p className="text-lg">
                <span className="font-bold text-purple-400">📌 Talep Türü:</span>{" "}
                {req.request_type}
              </p>
              <p className="text-sm mt-1 text-gray-300">
                <span className="font-semibold text-white">📝 Açıklama:</span>{" "}
                {req.description || "—"}
              </p>
              <p className="text-sm mt-1 text-gray-400">
                <span className="font-semibold text-white">📅 Tarih:</span>{" "}
                {new Date(req.created_at).toLocaleString()}
              </p>
              {req.status && (
                <p className="text-sm mt-1">
                  <span className="font-semibold text-white">🔖 Durum:</span>{" "}
                  <span className="px-2 py-1 rounded bg-blue-800 text-white text-xs">{req.status}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
