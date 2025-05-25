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

// 🧠 Dosya yükleme
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
    throw new Error("Dosya yüklenemedi: " + err);
  }

  return await res.json();
}

// 🔞 Uygunsuz içerik kontrolü
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

export default function Share() {
  const auth = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"en" | "tr" | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.user) return alert("Giriş yapmalısın.");
    if (!lang) return alert("Lütfen gönderi dili seçiniz.");

    const textValue = inputRef.current?.value.trim() || "";

    let mediaUrl = null;
    let mediaType = null;
    let isReel = false;

    try {
      setLoading(true);

      if (file) {
        const isNsfw = await checkNsfw(file);
        if (isNsfw) return alert("Uygunsuz görsel tespit edildi.");

        const result = await uploadFile(file);
        mediaUrl = result.url;
        mediaType = file.type.startsWith("image") ? "image" : "video";
        isReel = mediaType === "video";
      }

      if (!textValue && !mediaUrl) return alert("Metin veya medya ekle.");

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

      if (!res.ok) throw new Error("Paylaşım başarısız.");

      alert("Paylaşım yapıldı.");
      if (inputRef.current) inputRef.current.value = "";
      setFile(null);
      setLang(null);
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
  className="p-6 flex gap-5 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-2xl"
>
  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-500 shadow-lg">
    <Image
      src={auth?.user?.profile_image || "/icons/pp.png"}
      alt="Avatar"
      width={100}
      height={100}
    />
  </div>

  <div className="flex-1 flex flex-col gap-5">
    {/* 🌐 Dil Seçme */}
    <div className="flex gap-4 items-center">
      <span className="text-sm text-white font-semibold">Dil:</span>
      <button
        type="button"
        onClick={() => setLang("tr")}
        className={`rounded-full p-1 border-2 ${
          lang === "tr" ? "border-yellow-400 scale-110" : "border-transparent"
        } transition-transform hover:scale-105`}
      >
        <Image src="/icons/turkey.png" alt="TR" width={30} height={30} />
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded-full p-1 border-2 ${
          lang === "en" ? "border-yellow-400 scale-110" : "border-transparent"
        } transition-transform hover:scale-105`}
      >
        <Image src="/icons/united-kingdom.png" alt="EN" width={30} height={30} />
      </button>
    </div>

    {/* 📝 Metin Alanı */}
    <input
      ref={inputRef}
      type="text"
      placeholder="Ne düşünüyorsun?"
      className="bg-gray-900 outline-none placeholder:text-gray-400 text-base sm:text-lg text-white px-4 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-cyan-500"
    />

    {/* 📎 Dosya Önizlemesi */}
    {file && (
      <div className="relative p-3 border border-gray-600 bg-gray-900 rounded-xl shadow-lg">
        <p className="text-sm text-white font-medium">{file.name}</p>
        <span
          className="absolute top-2 right-2 bg-red-500 text-white px-2 rounded-full text-xs cursor-pointer hover:bg-red-600 transition"
          onClick={() => setFile(null)}
        >
          ✕
        </span>
      </div>
    )}

    {/* 📤 Alt Kısım */}
    <div className="flex items-center justify-between gap-4 flex-wrap mt-2">
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="file"
        accept="image/*,video/*"
      />
      <label htmlFor="file" className="cursor-pointer hover:opacity-80 transition">
        <Image src="/icons/camera.png" alt="Upload" width={26} height={26} />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-full py-2 px-6 disabled:opacity-50 transition"
      >
        {loading ? "Yükleniyor..." : "Paylaş"}
      </button>
    </div>
  </div>
</form>

  );
}
