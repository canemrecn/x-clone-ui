//src/components/Share.tsx
/*Bu dosya, kullanıcıların metin, fotoğraf veya video içeren gönderiler (post) oluşturmasını sağlayan Share 
adlı bileşeni içerir. Kullanıcı giriş yapmışsa, gönderiye metin yazabilir, fotoğraf/video ekleyebilir; 
medya dosyası varsa önce /api/image-upload ile ImageKit'e yüklenir, ardından metin ve medya bilgileri 
/api/posts/create endpoint’ine POST isteğiyle gönderilerek paylaşılır. Başarılı işlem sonrası giriş kutusu 
ve medya temizlenir. Ayrıca gönderi dili lang prop'u ile belirlenebilir ve video içerikler isReel olarak işaretlenir.*/
// ✅ GÜNCELLENMİŞ Share.tsx (video için tamamen çalışan hali)

"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import * as nsfwjs from "nsfwjs";

async function uploadFile(file: File): Promise<{ url: string; fileType: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/image-upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Dosya yuklenemedi: " + err);
  }

  return await res.json();
}

const checkNsfw = async (file: File): Promise<boolean> => {
  if (!file.type.startsWith("image")) return false;

  return new Promise(async (resolve) => {
    const image = document.createElement("img");
    image.src = URL.createObjectURL(file);
    image.crossOrigin = "anonymous";

    image.onload = async () => {
      const model = await nsfwjs.load();
      const predictions = await model.classify(image);
      const sensitive = predictions.find(
        (p) => ["Porn", "Hentai", "Sexy"].includes(p.className) && p.probability > 0.7
      );
      resolve(!!sensitive);
    };
  });
};

interface ShareProps {
  lang?: string;
}

export default function Share({ lang }: ShareProps) {
  const auth = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.user) return alert("Giriş yapmalısın");
    const textValue = inputRef.current?.value.trim() || "";

    let mediaUrl = null;
    let mediaType = null;
    let isReel = false;

    try {
      setLoading(true);

      if (file) {
        const isNsfw = await checkNsfw(file);
        if (isNsfw) return alert("Uygunsuz görsel");

        const result = await uploadFile(file);
        mediaUrl = result.url;
        mediaType = file.type.startsWith("image") ? "image" : "video";
        isReel = mediaType === "video";
      }

      if (!textValue && !mediaUrl) return alert("Metin veya medya ekle");

      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: textValue,
          media_url: mediaUrl,
          media_type: mediaType,
          isReel,
          lang,
          category_id: 1,
        }),
      });

      if (!res.ok) throw new Error("Paylaşım başarısız");

      alert("Paylaşım yapıldı");
      if (inputRef.current) inputRef.current.value = "";
      setFile(null);
    } catch (err) {
      console.error("Hata:", err);
      alert("Paylaşım hatası");
    } finally {
      setLoading(false);
    }
  }, [auth, file, lang]);

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 flex gap-4 bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-300 rounded-lg shadow-md"
    >
      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
        <Image
          src={auth?.user?.profile_image || "/icons/pp.png"}
          alt="Avatar"
          width={100}
          height={100}
        />
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="What is happening?"
          className="bg-gradient-to-br from-gray-800 to-gray-800 outline-none placeholder:text-white text-lg text-white px-2 py-1 border-b border-gray-300"
        />

        {file && (
          <div className="relative p-2 border border-gray-300 bg-gradient-to-br from-gray-800 to-gray-800 rounded shadow-md">
            <p className="text-sm text-white font-semibold">{file.name}</p>
            <span
              className="absolute top-1 right-1 bg-red-500 text-white px-2 rounded cursor-pointer hover:bg-red-600 transition"
              onClick={() => setFile(null)}
            >
              X
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file"
            accept="image/*,video/*"
          />
          <label htmlFor="file" className="cursor-pointer hover:opacity-80">
            <Image src="/icons/camera.png" alt="Upload" width={24} height={24} />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full py-2 px-4 disabled:opacity-50"
          >
            {loading ? "Yükleniyor..." : "Post"}
          </button>
        </div>
      </div>
    </form>
  );
}
