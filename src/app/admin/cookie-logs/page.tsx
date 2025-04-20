// ✅ src/app/admin/cookie-logs/page.tsx
"use client";

import { useEffect, useState } from "react";

type Log = {
  id: number;
  user_id: number | null;
  full_name?: string;
  username?: string;
  consent_type: "all" | "necessary";
  analytics: boolean;
  marketing: boolean;
  ip_address: string;
  user_agent: string;
  created_at: string;
};

export default function CookieLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/admin/cookie-consent/logs", {
          credentials: "include",
        });
        const data = await res.json();
        setLogs(data.logs || []);
        setFilteredLogs(data.logs || []);
      } catch (err) {
        console.error("Logları alırken hata:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleSearch = () => {
    if (!searchId) {
      setFilteredLogs(logs);
    } else {
      const id = parseInt(searchId);
      if (!isNaN(id)) {
        setFilteredLogs(logs.filter((log) => log.user_id === id));
      }
    }
  };

  const downloadAsJSON = () => {
    const jsonStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cookie_logs.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsCSV = () => {
    const csvRows = [
      [
        "ID",
        "Kullanıcı",
        "Onay Türü",
        "Analytics",
        "Marketing",
        "IP",
        "Tarayıcı",
        "Tarih",
      ],
      ...filteredLogs.map((log) => [
        log.user_id ?? "Anonim",
        log.user_id
          ? `${log.full_name || "-"} (@${log.username || "-"})`
          : "Anonim",
        log.consent_type,
        log.analytics ? "✔" : "—",
        log.marketing ? "✔" : "—",
        log.ip_address,
        log.user_agent.replace(/\s+/g, " ").slice(0, 80),
        new Date(log.created_at).toLocaleString(),
      ]),
    ];

    const csvContent = csvRows
      .map((row) =>
        row
          .map((cell) => `"${(cell ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cookie_logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Çerez Onay Kayıtları</h1>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Kullanıcı ID ara..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white border border-gray-600"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            Ara
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={downloadAsJSON}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow text-sm"
          >
            JSON İndir
          </button>
          <button
            onClick={downloadAsCSV}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg shadow text-sm"
          >
            CSV İndir
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center">Yükleniyor...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-600 text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-3 border">ID</th>
                <th className="p-3 border">Kullanıcı</th>
                <th className="p-3 border">Onay Türü</th>
                <th className="p-3 border">Analytics</th>
                <th className="p-3 border">Marketing</th>
                <th className="p-3 border">IP</th>
                <th className="p-3 border">Tarayıcı</th>
                <th className="p-3 border">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-600 hover:bg-gray-800">
                  <td className="p-2 text-center">{log.user_id ?? "Anonim"}</td>
                  <td className="p-2 text-center">
                    {log.user_id
                      ? `${log.full_name || "-"} (@${log.username || "-"})`
                      : "Anonim"}
                  </td>
                  <td className="p-2 text-center">{log.consent_type}</td>
                  <td className="p-2 text-center">{log.analytics ? "✔" : "—"}</td>
                  <td className="p-2 text-center">{log.marketing ? "✔" : "—"}</td>
                  <td className="p-2 text-center">{log.ip_address}</td>
                  <td className="p-2 text-center truncate max-w-xs">{log.user_agent}</td>
                  <td className="p-2 text-center">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
