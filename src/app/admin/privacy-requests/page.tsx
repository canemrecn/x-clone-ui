// ✅ src/app/admin/privacy-requests/page.tsx
"use client";
import { useEffect, useState } from "react";

type Request = {
  id: number;
  name: string;
  email: string;
  request_type: string;
  description: string;
  created_at: string;
};

export default function PrivacyRequestAdminPage() {
  const [requests, setRequests] = useState<Request[]>([]);

  const fetchRequests = async () => {
    const res = await fetch("/api/admin/privacy-requests", { credentials: "include" });
    const data = await res.json();
    setRequests(data.requests || []);
  };

  const handleApprove = async (email: string) => {
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    alert(data.message);
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-800 text-white">
      <h1 className="text-2xl font-bold mb-4">KVKK Başvuruları</h1>
      {requests.map((req) => (
        <div key={req.id} className="mb-4 p-4 border border-gray-600 rounded">
          <p><b>İsim:</b> {req.name}</p>
          <p><b>E-posta:</b> {req.email}</p>
          <p><b>Talep Türü:</b> {req.request_type}</p>
          <p><b>Açıklama:</b> {req.description}</p>
          <p><b>Tarih:</b> {req.created_at}</p>
          {req.request_type === "veri-silme" && (
            <button
              onClick={() => handleApprove(req.email)}
              className="mt-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Kullanıcıyı Sil
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
