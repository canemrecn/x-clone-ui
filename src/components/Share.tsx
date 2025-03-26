"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

/** 
 * Foto/Video dosyasını ImageKit'e yüklemek için 
 */
async function uploadFile(file: File): Promise<{ url: string; fileType: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/image-upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error("Dosya yükleme işlemi başarısız.");
  }
  const data = await res.json();
  return data;
}

interface ShareProps {
  lang?: string;
}

export default function Share({ lang }: ShareProps) {
  const auth = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!auth?.user) {
        alert("Lütfen giriş yapın.");
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Token bulunamadı. Lütfen tekrar giriş yapın.");
        return;
      }

      const textValue = inputRef.current?.value.trim() || "";

      let mediaUrl: string | null = null;
      let mediaType: string | null = null;
      let isReel = false;

      if (file) {
        try {
          const uploadResult = await uploadFile(file);
          mediaUrl = uploadResult.url;
          if (file.type.includes("image")) {
            mediaType = "image";
          } else if (file.type.includes("video")) {
            mediaType = "video";
            isReel = true;
          }
        } catch (err) {
          console.error("Dosya yükleme hatası:", err);
          alert("Dosya yükleme sırasında hata oluştu.");
          return;
        }
      }

      if (!textValue && !mediaUrl) {
        alert("Lütfen bir metin veya medya dosyası ekleyin.");
        return;
      }

      try {
        const res = await fetch("/api/posts/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            content: textValue,
            media_url: mediaUrl,
            media_type: mediaType,
            isReel,
            lang,
            category_id: 1,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Bilinmeyen sunucu hatası");
        }

        alert("Gönderi başarıyla paylaşıldı!");
        if (inputRef.current) inputRef.current.value = "";
        setFile(null);
      } catch (error) {
        console.error("Post Error:", error);
        alert(
          "Gönderi paylaşırken hata oluştu: " +
            (error instanceof Error ? error.message : "Bilinmeyen hata")
        );
      }
    },
    [auth, file, lang]
  );

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
              className="absolute top-1 right-1 bg-gradient-to-br from-gray-800 to-gray-800 text-white px-2 rounded cursor-pointer hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-700 transition"
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
            className="bg-gradient-to-br from-gray-800 to-gray-700 text-white font-bold rounded-full py-2 px-4 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition-all"
          >
            Post
          </button>
        </div>
      </div>
    </form>
  );
}
