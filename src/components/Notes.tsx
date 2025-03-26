//src/components/Notes.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
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

  useEffect(() => {
    async function fetchNotes() {
      try {
        if (!auth?.user) return;
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

  if (loading) return <p className="text-black p-4">Loading notes...</p>;
  if (!auth?.user)
    return <p className="text-black p-4">Please login to see your notes.</p>;

  const handleAddNote = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Maksimum 5 not kontrolü
    if (notes.length >= 5) {
      alert("You can only have a maximum of 5 notes.");
      return;
    }

    if (!auth?.user) {
      alert("Please login first!");
      return;
    }

    const token = localStorage.getItem("token");
    fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, text }),
    })
      .then((res) => res.json())
      .then((data) => {
        setNotes((prev) => [
          { id: data.noteId, text, created_at: new Date().toISOString() },
          ...prev,
        ]);
        setText("");
      })
      .catch(console.error);
  };

  return (
    <div className="p-4 rounded-2xl border border-[#BDC4BF] flex flex-col gap-4 bg-[#FAFCF2] shadow-md w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-black">Notes</h1>

      <form onSubmit={handleAddNote} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a note..."
          className="flex-1 p-2 border border-[#BDC4BF] rounded text-black bg-[#A8DBF0] placeholder-[#3E6A8A] outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-[#3E6A8A] text-white px-4 py-2 rounded font-bold hover:bg-[#2C4D66] transition"
        >
          Add
        </button>
      </form>

      {notes.length === 0 ? (
        <p className="text-black">No notes yet.</p>
      ) : (
        notes.map((note) => (
          <div
            key={note.id}
            className="p-4 rounded-2xl border border-[#BDC4BF] bg-[#A8DBF2] relative shadow-md"
          >
            <button
              onClick={() =>
                setNotes(notes.filter((n) => n.id !== note.id))
              }
              className="absolute top-2 right-2 text-sm bg-red-500 text-black rounded px-2 hover:bg-red-700 transition"
            >
              X
            </button>
            <p className="text-black">{note.text}</p>
          </div>
        ))
      )}
    </div>
  );
}
