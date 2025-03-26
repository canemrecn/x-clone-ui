"use client";

import { useState, useEffect, FormEvent, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

interface Note {
  id: number;
  text: string;
  created_at: string;
}

export default function NotesPage() {
  const auth = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  // Notları fetch ederken Authorization header ekleyin
  useEffect(() => {
    async function fetchNotes() {
      if (!auth?.user) {
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/notes", {
          headers: { 
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          throw new Error("Notes fetch error");
        }
        const data = await res.json();
        setNotes(data.notes || []);
      } catch (error) {
        console.error("fetchNotes error:", error);
        setError("Error fetching notes.");
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, [auth]);

  // Not ekleme işlemi – token'ı header’da gönderiyoruz ve sadece not metnini body’ye koyuyoruz
  const handleAddNote = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!text.trim()) return;
      if (!auth?.user) {
        alert("Please login first!");
        return;
      }
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ text }),
        });
        if (res.ok) {
          const data = await res.json();
          // Yeni notu listenin başına ekliyoruz
          setNotes((prev) => [
            { id: data.noteId, text, created_at: new Date().toISOString() },
            ...prev,
          ]);
          setText("");
        } else {
          // Hata kodunu loglayarak detaylı hata mesajı alabilirsiniz
          const errorData = await res.json();
          console.error("Failed to add note:", errorData);
          setError(errorData.message || "Error adding note.");
        }
      } catch (error) {
        console.error("handleAddNote error:", error);
        setError("Error adding note.");
      }
    },
    [text, auth]
  );

  const renderedNotes = useMemo(() => {
    if (notes.length === 0)
      return (
        <p className="mt-6 text-center text-lg text-white">
          No notes yet.
        </p>
      );
    return notes.map((note) => (
      <div
        key={note.id}
        className="p-4 rounded-lg border border-gray-300 bg-gradient-to-br from-gray-800 to-gray-700 shadow-md relative"
      >
        <p className="text-white font-semibold">{note.text}</p>
        <span className="text-xs text-white">
          {new Date(note.created_at).toLocaleString()}
        </span>
      </div>
    ));
  }, [notes]);

  if (loading) {
    return (
      <p className="p-4 text-center text-white font-semibold">
        Loading notes...
      </p>
    );
  }
  if (!auth?.user) {
    return (
      <div className="p-4 text-center bg-gradient-to-br from-gray-800 to-gray-700 text-white rounded-lg shadow-md">
        <p>
          Please{" "}
          <a href="/login" className="font-bold underline">
            login
          </a>{" "}
          to see your notes.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md">
        Your Notes
      </h1>
      {error && (
        <p className="text-center text-white mt-4">
          {error}
        </p>
      )}
      <form
        onSubmit={handleAddNote}
        className="flex gap-2 mt-6 max-w-full sm:max-w-2xl mx-auto"
      >
        <input
          type="text"
          placeholder="Add a note..."
          className="flex-1 p-3 border border-gray-300 rounded-lg text-white shadow-sm bg-gradient-to-br from-gray-800 to-gray-800 placeholder-white outline-none focus:ring-2 focus:ring-gray-600"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-gradient-to-br from-gray-800 to-gray-700 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition-all"
        >
          Add
        </button>
      </form>
      <div className="mt-6 max-w-full sm:max-w-2xl mx-auto">
        {renderedNotes}
      </div>
    </div>
  );
}
