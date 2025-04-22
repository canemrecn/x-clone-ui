"use client";

import { useEffect, useState } from "react";

type KvkkRequest = {
  id: number;
  request_type: string;
  description: string;
  created_at: string;
  status?: string; // opsiyonel: "beklemede", "tamamlandı" gibi bir yapı varsa
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
    <div className="min-h-screen p-6 bg-gray-800 text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">KVKK Başvuru Geçmişi</h1>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : requests.length === 0 ? (
        <p>Henüz başvuru yapılmamış.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li key={req.id} className="p-4 bg-gray-700 rounded shadow">
              <p><b>Talep Türü:</b> {req.request_type}</p>
              <p><b>Açıklama:</b> {req.description || "—"}</p>
              <p><b>Tarih:</b> {new Date(req.created_at).toLocaleString()}</p>
              {req.status && <p><b>Durum:</b> {req.status}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
