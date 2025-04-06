//src/app/admin/warnings/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Warning {
  id: number;
  post_id?: number | null;
  comment_id?: number | null;
  user_id: number;
  username: string;
  full_name: string;
  reason: string;
  severity: string;
  triggered_by: string;
  seen: boolean;
  created_at: string;
}

export default function WarningsPage() {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWarnings = async () => {
      try {
        const res = await fetch("/api/warnings/history", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Uyarılar alınamadı");
        }

        const { warnings } = await res.json();
        setWarnings(warnings);
      } catch (err: any) {
        setError(err.message || "Hata oluştu");
      }
    };

    fetchWarnings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Uyarı Geçmişi</h1>
      {error ? (
        <p className="text-red-400 text-center">{error}</p>
      ) : (
        <table className="w-full border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-3 text-left">Kullanıcı</th>
              <th className="p-3 text-left">Sebep</th>
              <th className="p-3 text-left">Ciddiyet</th>
              <th className="p-3 text-left">Kaynak</th>
              <th className="p-3 text-left">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {warnings.map((warning) => (
              <tr
                key={warning.id}
                className="hover:bg-gray-800 border-t border-gray-700"
              >
                <td className="p-3">
                  {warning.full_name}{" "}
                  <span className="text-sm text-gray-400">@{warning.username}</span>
                </td>
                <td className="p-3">
                  {(warning.post_id && warning.comment_id) ? (
                    <Link
                      href={`/post/${warning.post_id}#comment-${warning.comment_id}`}
                      className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                    >
                      {warning.reason}
                    </Link>
                  ) : warning.post_id ? (
                    <Link
                      href={`/post/${warning.post_id}`}
                      className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                    >
                      {warning.reason}
                    </Link>
                  ) : (
                    <span className="italic text-gray-400">{warning.reason}</span>
                  )}
                </td>
                <td className="p-3 capitalize">{warning.severity}</td>
                <td className="p-3">{warning.triggered_by}</td>
                <td className="p-3">
                  {new Date(warning.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
