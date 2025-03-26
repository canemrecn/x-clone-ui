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
        const token = localStorage.getItem("token");
        const res = await fetch("/api/notes", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Notes fetch error");
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

  // Add a new note
  const handleAddNote = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!text.trim()) return;

    if (!auth?.user) {
      alert("Please login first!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token not found. Please login again.");
      return;
    }

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [
          { id: data.noteId, text, created_at: new Date().toISOString() },
          ...prev,
        ]);
        setText("");
      } else {
        const errorData = await res.json();
        console.error("Failed to add note:", errorData);
        setError(errorData.message || "Error adding note.");
      }
    } catch (error) {
      console.error("handleAddNote error:", error);
      setError("Error adding note.");
    }
  }, [auth, text]);

  const renderedNotes = useMemo(() => {
    if (notes.length === 0) {
      return <p className="text-center text-white">No notes yet.</p>;
    }
    return notes.map((note) => (
      <div
        key={note.id}
        className="p-4 rounded-2xl border border-gray-300 bg-gradient-to-br from-gray-800 to-gray-700 relative shadow-2xl"
      >
        <button
          onClick={() => setNotes((prev) => prev.filter((n) => n.id !== note.id))}
          className="absolute top-2 right-2 text-sm bg-red-600 text-white rounded px-2 hover:bg-red-500 transition"
        >
          X
        </button>
        <p className="text-white">{note.text}</p>
      </div>
    ));
  }, [notes]);

  if (loading)
    return <p className="text-center p-4 text-white">Loading notes...</p>;
  if (!auth?.user)
    return <p className="text-center p-4 text-white">Please login to see your notes.</p>;

  return (
    <div className="p-4 rounded-2xl border border-gray-300 flex flex-col gap-4 bg-gradient-to-br from-gray-800 to-gray-700 shadow-2xl w-full max-w-3xl mx-auto text-white">
      <h1 className="text-xl font-bold text-center">Notes</h1>
      <form onSubmit={handleAddNote} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a note..."
          className="flex-1 p-2 border border-gray-300 rounded text-white bg-gray-900 placeholder-white outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-300 text-white px-4 py-2 rounded font-bold hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition"
        >
          Add
        </button>
      </form>
      {error && <p className="text-center text-white">{error}</p>}
      {renderedNotes}
    </div>
  );
}
