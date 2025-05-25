"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function DailyPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState("");
  const [lang, setLang] = useState("en");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/daily", { credentials: "include" });
      const data = await res.json();
      if (!data.error) setNotes(data);
    } catch (err) {
      console.error("Notlar alınamadı:", err);
    }
  };

  const handleSave = async () => {
    setErrorMsg("");
    if (!content.trim()) {
      setErrorMsg("Günlük içeriği boş olamaz.");
      return;
    }

    try {
      const res = await axios.post(
        "/api/daily",
        { content, lang },
        { withCredentials: true }
      );

      if (res.data.success) {
        setContent("");
        setLang("en");
        setIsWriting(false);
        fetchNotes();
      }
    } catch (err: any) {
      console.error("Günlük kaydedilemedi:", err);
      setErrorMsg(err.response?.data?.error || "Bir hata oluştu.");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const formatDateTime = (datetime: string): string => {
    const date = new Date(datetime);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year} ${hour}:${minute}`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 max-w-2xl mx-auto py-10 px-4 text-white rounded-xl shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-center tracking-wide">Günlük</h1>

      <div className="mb-6 text-center">
        <button
          onClick={() => setIsWriting(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition"
        >
          Yeni Günlük
        </button>
      </div>

      {isWriting && (
        <div className="mb-6 space-y-3">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-700"
          >
            <option value="en">İngilizce</option>
          </select>

          <textarea
            className="w-full h-40 p-3 rounded-lg bg-gray-900 text-white border border-gray-700"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bugün ne yaşadın?.."
          />

          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow transition"
          >
            Kaydet
          </button>

          {errorMsg && (
            <div className="text-red-400 font-medium">{errorMsg}</div>
          )}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Kayıtlı Günlükler</h2>
      <div className="flex flex-col gap-4">
        {notes.map((note) => (
          <Link href={`/daily/${note.id}`} key={note.id}>
            <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg hover:bg-gray-700 cursor-pointer transition shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-200">{formatDateTime(note.created_at)}</span>
                <span className="text-sm text-yellow-400 font-semibold">
                  Hata: %{(note.error_rate * 100).toFixed(0)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
