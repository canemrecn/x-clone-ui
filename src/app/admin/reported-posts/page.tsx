"use client";

import { useEffect, useState } from "react";

interface ReportedPost {
  id: number; // report id
  post_id: number;
  user_id: number;
  reason: string;
  created_at: string;
  title: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  username: string;
  full_name: string;
}

export default function ReportedPostsPage() {
  const [reports, setReports] = useState<ReportedPost[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reported-posts", {
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Veri çekilemedi");
        }
        const data = await res.json();
        setReports(data.reports);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchReports();
  }, []);

  async function handleDelete(postId: number, reportId: number) {
    const confirm = window.confirm("Bu gönderiyi silmek istediğine emin misin?");
    if (!confirm) return;

    const res = await fetch(`/api/posts/delete/${postId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      // Hem gönderiyi hem raporu arayüzden kaldır
      setReports((prev) => prev.filter((r) => r.post_id !== postId));
    }
  }

  async function handleIgnore(reportId: number) {
    const res = await fetch(`/api/reported-posts/${reportId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Şikayet Edilen Gönderiler</h1>
      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : reports.length === 0 ? (
        <p className="text-center">Şikayet edilen gönderi yok.</p>
      ) : (
        <table className="w-full border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-2 text-left">Kullanıcı</th>
              <th className="p-2 text-left">İçerik</th>
              <th className="p-2 text-left">Şikayet Nedeni</th>
              <th className="p-2 text-left">Tarih</th>
              <th className="p-2">Medya</th>
              <th className="p-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-t border-gray-700">
                <td className="p-2">
                  {report.full_name} <span className="text-gray-400">@{report.username}</span>
                </td>
                <td className="p-2 whitespace-pre-wrap max-w-xs overflow-hidden">
                  {report.content}
                </td>
                <td className="p-2 whitespace-pre-wrap max-w-xs overflow-hidden">
                  {report.reason}
                </td>
                <td className="p-2">
                  {new Date(report.created_at).toLocaleString()}
                </td>
                <td className="p-2">
                  {report.media_url && (
                    report.media_type?.includes("video") ? (
                      <video
                        src={report.media_url}
                        controls
                        className="max-w-[180px] max-h-[140px] rounded shadow"
                      />
                    ) : (
                      <img
                        src={report.media_url}
                        alt="media"
                        className="max-w-[180px] max-h-[140px] object-cover rounded shadow"
                      />
                    )
                  )}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => handleDelete(report.post_id, report.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded mr-2"
                  >
                    Gönderiyi Sil
                  </button>
                  <button
                    onClick={() => handleIgnore(report.id)}
                    className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded"
                  >
                    Yoksay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
