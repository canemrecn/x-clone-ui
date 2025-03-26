"use client";

import { useState, useEffect, FormEvent } from "react";
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
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Notes fetch error");
        const data = await res.json();
        setNotes(data.notes || []);
      } catch (error) {
        console.error("fetchNotes error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, [auth]);

  const handleAddNote = async (e: FormEvent) => {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, text }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [
          { id: data.noteId, text, created_at: new Date().toISOString() },
          ...prev,
        ]);
        setText("");
      }
    } catch (error) {
      console.error("handleAddNote error:", error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!auth?.user) return;
    const confirmDel = confirm("Are you sure you want to delete this note?");
    if (!confirmDel) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch (error) {
      console.error("handleDeleteNote error:", error);
    }
  };

  if (loading)
    return <p className="p-4 text-center text-black font-semibold">Loading notes...</p>;

  if (!auth?.user) {
    return (
      <div className="p-4 text-center bg-[#FAFCF2] text-black">
        <p>
          Please{" "}
          <a href="/login" className="text-black font-bold underline">
            login
          </a>{" "}
          to see your notes.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFCF2] text-black p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-[#A8DBF0] via-[#FAFCF2] to-[#BDC4BF] p-4 rounded-lg shadow-md">
        Your Notes
      </h1>

      <form onSubmit={handleAddNote} className="flex gap-2 mt-6 max-w-full sm:max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Add a note..."
          className="flex-1 p-3 border border-[#BDC4BF] rounded-lg text-black shadow-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-[#A8DBF0] text-black px-6 py-3 rounded-lg font-bold shadow-md hover:bg-[#3E6A8A] transition-all"
        >
          Add
        </button>
      </form>

      {notes.length === 0 ? (
        <p className="mt-6 text-center text-lg">No notes yet.</p>
      ) : (
        <div className="flex flex-col gap-4 mt-6 max-w-full sm:max-w-2xl mx-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-lg border border-[#cae1ff] flex flex-col gap-4 bg-[#cae1ff] shadow-md relative"
            >
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="absolute top-2 right-2 text-sm bg-red-600 text-black rounded px-2 shadow-md"
              >
                X
              </button>
              <p className="text-black font-semibold">{note.text}</p>
              <span className="text-xs text-black">
                {new Date(note.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
