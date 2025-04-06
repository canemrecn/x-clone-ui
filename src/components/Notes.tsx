//src/components/Notes.tsx
/*Bu dosya, kullanıcının kişisel notlarını görüntüleyip ekleyebileceği bir not yönetim bileşeni (Notes) sunar; giriş yapmış 
kullanıcıdan token alarak /api/notes endpoint’inden notları çeker, yeni not ekleme formuyla notları sunucuya gönderir, eklenen 
notu anlık olarak listeye ekler ve her not için silme butonu sağlar (ancak sunucudan silme işlemi yapılmaz); tüm işlemler boyunca 
yükleme ve hata durumları da kullanıcıya bildirilir.*/
"use client";

import React, { useState, useEffect, FormEvent, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

interface Note {
  id: number;
  text: string;
  created_at: string;
}

export default function Notes() {
  const auth = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchNotes() {
      try {
        if (!auth?.user) return;
        const res = await fetch("/api/notes", {
          credentials: "include", // HTTP-only cookie gönderimi
        });
        if (!res.ok) throw new Error("Notlar alınamadı");
        const data = await res.json();
        // data.notes olup olmadığını kontrol ediyoruz
        if (data?.notes) {
          setNotes(data.notes || []);
        } else {
          setError("Notlar alınırken bir hata oluştu.");
        }
      } catch (error) {
        console.error("fetchNotes error:", error);
        setError("Notlar alınırken hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, [auth]);

  // Yeni not ekle
  const handleAddNote = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      if (!text.trim()) {
        setError("Not boş bırakılamaz.");
        return;
      }

      if (!auth?.user) {
        alert("Lütfen giriş yapın!");
        return;
      }

      try {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // HTTP-only cookie gönderimi
          body: JSON.stringify({ text }),
        });

        if (res.ok) {
          const data = await res.json();
          // data.note olup olmadığını kontrol ediyoruz
          if (data?.note) {
            setNotes((prev) => [
              { id: data.note.id, text: data.note.text, created_at: data.note.created_at },
              ...prev,
            ]);
            setText("");
          } else {
            setError("Not eklenirken bir hata oluştu.");
          }
        } else {
          const data = await res.json();
          console.error("Note ekleme hatası:", data);
          setError(data.message || "Not eklenemedi.");
        }
      } catch (error) {
        console.error("handleAddNote error:", error);
        setError("Not eklenirken bir hata oluştu.");
      }
    },
    [auth, text]
  );

  const renderedNotes = useMemo(() => {
    if (notes.length === 0) {
      return <p className="text-center text-white">Henüz not yok.</p>;
    }

    return notes.map((note) => (
      <div
        key={note.id}
        className="p-4 rounded-2xl border border-gray-300 bg-gradient-to-br from-gray-800 to-gray-700 relative shadow-2xl"
      >
        <button
          onClick={() => handleDelete(note.id)}
          className="absolute top-2 right-2 text-sm bg-red-600 text-white rounded px-2 hover:bg-red-500 transition"
        >
          X
        </button>
        <p className="text-white">{note.text}</p>
        <p className="text-xs text-gray-400 mt-2">{new Date(note.created_at).toLocaleString()}</p>
      </div>
    ));
  }, [notes]);

  const handleDelete = async (noteId: number) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
        credentials: "include", // HTTP-only cookie gönderimi
      });

      if (res.ok) {
        setNotes((prev) => prev.filter((note) => note.id !== noteId));
      } else {
        const data = await res.json();
        console.error("Note silme hatası:", data);
        setError(data.message || "Not silinemedi.");
      }
    } catch (error) {
      console.error("handleDelete error:", error);
      setError("Not silinirken bir hata oluştu.");
    }
  };

  if (loading) {
    return <p className="text-center p-4 text-white">Notlar yükleniyor...</p>;
  }

  if (!auth?.user) {
    return <p className="text-center p-4 text-white">Notlarını görmek için giriş yap.</p>;
  }

  return (
    <div className="p-4 rounded-2xl border border-gray-300 flex flex-col gap-4 bg-gradient-to-br from-gray-800 to-gray-700 shadow-2xl w-full max-w-3xl mx-auto text-white">
      <h1 className="text-xl font-bold text-center">Notlarım</h1>
      <form onSubmit={handleAddNote} className="flex gap-2">
        <input
          type="text"
          placeholder="Yeni not ekle..."
          className="flex-1 p-2 border border-gray-300 rounded text-white bg-gray-900 placeholder-white outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-300 text-white px-4 py-2 rounded font-bold hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition"
        >
          Ekle
        </button>
      </form>
      {error && <p className="text-center text-red-400">{error}</p>}
      {renderedNotes}
    </div>
  );
}
