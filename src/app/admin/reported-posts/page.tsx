"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function ReportedPostsPage() {
  const { data, error, mutate } = useSWR("/api/reported-posts", fetcher);

  const handleDelete = async (postId: number) => {
    const confirm = window.confirm("Bu gönderiyi silmek istediğinize emin misiniz?");
    if (!confirm) return;

    await fetch(`/api/posts/delete/${postId}`, {
      method: "DELETE",
      credentials: "include",
    });
    mutate();
  };

  const handleIgnore = async (reportId: number) => {
    await fetch(`/api/reports/ignore/${reportId}`, {
      method: "POST",
      credentials: "include",
    });
    mutate();
  };

  if (!data && !error) return <div className="text-center">Yükleniyor...</div>;
  if (error) return <div className="text-center text-red-500">Hata oluştu</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Şikayet Edilen Gönderiler</h1>
      {data.reports.length === 0 ? (
        <p>Hiç şikayet edilen gönderi yok.</p>
      ) : (
        data.reports.map((report: any) => (
          <div
            key={report.id}
            className="p-4 mb-2 bg-gray-800 rounded flex justify-between items-center"
          >
            <div>
              <p>Gönderi ID: {report.post_id}</p>
              <p>Şikayet Nedeni: {report.reason || "Belirtilmedi"}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(report.post_id)}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
              >
                Gönderiyi Sil
              </button>
              <button
                onClick={() => handleIgnore(report.id)}
                className="bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded"
              >
                Yoksay
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
