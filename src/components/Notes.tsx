//src/components/Notes.tsx
/*Bu dosya, kullanıcının kişisel notlarını görüntüleyip ekleyebileceği bir not yönetim bileşeni (Notes) sunar; giriş yapmış 
kullanıcıdan token alarak /api/notes endpoint’inden notları çeker, yeni not ekleme formuyla notları sunucuya gönderir, eklenen 
notu anlık olarak listeye ekler ve her not için silme butonu sağlar (ancak sunucudan silme işlemi yapılmaz); tüm işlemler boyunca 
yükleme ve hata durumları da kullanıcıya bildirilir.*/
"use client";

import React, { useState, useEffect, FormEvent, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { AnaglyphEffect } from "three/examples/jsm/effects/AnaglyphEffect.js";


interface Note {
  id: number;
  text: string;
  created_at: string;
}

function AnaglyphRenderer() {
  const { gl, size, scene, camera } = useThree();
  const effectRef = useRef<AnaglyphEffect | null>(null);

  useEffect(() => {
    const effect = new AnaglyphEffect(gl);

    effect.setSize(size.width, size.height);
    effectRef.current = effect;

    const originalRender = gl.render;
    gl.render = () => effect.render(scene, camera);

    return () => {
      gl.render = originalRender;
    };
  }, [gl, size, scene, camera]);

  return null;
}

function SpinningCube() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#F9911C" />
    </mesh>
  );
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
        const res = await fetch("/api/notes", { credentials: "include" });
        if (!res.ok) throw new Error("Notlar alınamadı");
        const data = await res.json();
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

  const handleAddNote = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      if (notes.length >= 2) {
        setError("En fazla 2 not ekleyebilirsin.");
        return;
      }

      if (!text.trim()) {
        setError("Not boş bırakılamaz.");
        return;
      }

      if (text.trim().length > 45) {
        setError("Not en fazla 45 karakter olabilir.");
        return;
      }

      if (!auth?.user) {
        alert("Lütfen giriş yapın!");
        return;
      }

      try {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text }),
        });

        if (res.ok) {
          const data = await res.json();
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
    [auth, text, notes]
  );

  const handleDelete = async (noteId: number) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
        credentials: "include",
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

  if (loading) return <p className="text-center p-4 text-white">Notlar yükleniyor...</p>;
  if (!auth?.user) return <p className="text-center p-4 text-white">Notlarını görmek için giriş yap.</p>;

  return (
    <div className="p-5 rounded-2xl border border-gray-700 flex flex-col gap-4 bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl w-full max-w-3xl mx-auto text-white">
      <h1 className="text-2xl font-bold text-center text-white tracking-wide">Notlarım</h1>

      {/* Not Ekleme Formu */}
      <form onSubmit={handleAddNote} className="flex gap-3">
        <input
          type="text"
          maxLength={45}
          placeholder="Yeni not ekle... (Max 45 karakter)"
          className="flex-1 p-3 rounded-lg border border-gray-600 bg-gray-900 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-500 transition"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={notes.length >= 2}
        />
        <button
          type="submit"
          className={`px-5 py-2 rounded-lg font-semibold border transition-all duration-200 ${
            notes.length >= 2
              ? "bg-gray-600 cursor-not-allowed border-gray-600 text-gray-300"
              : "bg-gradient-to-br from-orange-500 to-yellow-500 text-white border-none hover:brightness-110"
          }`}
          disabled={notes.length >= 2}
        >
          Ekle
        </button>
      </form>

      {error && <p className="text-center text-red-400 font-medium">{error}</p>}

      {notes.length === 0 ? (
        <p className="text-center text-gray-300">Henüz not yok.</p>
      ) : (
        notes.map((note) => (
          <div
            key={note.id}
            className="p-4 rounded-xl border border-gray-600 bg-gradient-to-br from-gray-800 to-gray-700 relative shadow-lg hover:ring-2 hover:ring-orange-500 transition-all"
          >
            <button
              onClick={() => handleDelete(note.id)}
              className="absolute top-2 right-2 text-sm bg-red-600 text-white rounded px-2 hover:bg-red-500 transition-all"
            >
              ✕
            </button>
            <p className="text-gray-100 break-words">{note.text}</p>
            <p className="text-xs text-gray-400 mt-2 italic">
              {new Date(note.created_at).toLocaleString("tr-TR")}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
