// src/components/Share.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Image1 from "./image";
import { useAuth } from "@/context/AuthContext";

interface ShareProps {
  lang?: string;
}

export default function Share({ lang }: ShareProps) {
  const auth = useAuth();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug: Tarayıcı konsolunda lang değerini görün
    console.log("Share.tsx - incoming lang prop:", lang);

    if (!auth?.user) {
      return;
    }

    const token = localStorage.getItem("token");
    let mediaUrl: string | null = null;
    let mediaType: string | null = null;

    if (file) {
      if (file.type.includes("image")) {
        mediaUrl = "/some/fake/image.jpg";
        mediaType = "image";
      } else if (file.type.includes("video")) {
        mediaUrl = "/some/fake/video.mp4";
        mediaType = "video";
      }
    }

    // Debug: Gönderilen verileri görün
    console.log("Share.tsx - sending data:", {
      token,
      title: "Post",
      content,
      category_id: 1,
      media_url: mediaUrl,
      media_type: mediaType,
      lang,
    });

    const res = await fetch("/api/posts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        title: "Post",
        content,
        category_id: 1,
        media_url: mediaUrl,
        media_type: mediaType,
        lang, // Dil bilgisi
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error("Post Error:", data.message);
      alert("Server Error: " + data.message);
    } else {
      alert("Post shared!");
      setContent("");
      setFile(null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 flex gap-4 bg-[#FAFCF2] border border-[#BDC4BF] rounded-lg shadow-md"
    >
      {/* Profil Resmi */}
      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#3E6A8A]">
        <Image
          src={auth?.user?.profile_image || "/icons/pp.png"}
          alt="Avatar"
          width={100}
          height={100}
        />
      </div>

      {/* Metin Alanı + Dosya Yükleme + Gönder Butonu */}
      <div className="flex-1 flex flex-col gap-4">
        <input
          type="text"
          name="desc"
          placeholder="What is happening?"
          className="bg-transparent outline-none placeholder:text-[#3E6A8A] text-lg text-[#3E6A8A] px-2 py-1 border-b border-[#BDC4BF]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {file && (
          <div className="relative p-2 border border-[#BDC4BF] bg-[#A8DBF0] rounded shadow-md">
            <p className="text-sm text-[#3E6A8A] font-semibold">{file.name}</p>
            <span
              className="absolute top-1 right-1 bg-[#3E6A8A] text-white px-2 rounded cursor-pointer"
              onClick={() => setFile(null)}
            >
              X
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Dosya Yükleme İkonları */}
          <div className="flex gap-4 flex-wrap">
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                }
              }}
              className="hidden"
              id="file"
              accept="image/*,video/*"
            />
            <label htmlFor="file">
              <Image1
                path="icons/image.svg"
                alt="Upload Image"
                w={24}
                h={24}
                className="cursor-pointer hover:opacity-80"
              />
            </label>
            <Image1
              path="icons/gif.svg"
              alt="Upload GIF"
              w={24}
              h={24}
              className="cursor-pointer hover:opacity-80"
            />
            <Image1
              path="icons/poll.svg"
              alt="Create Poll"
              w={24}
              h={24}
              className="cursor-pointer hover:opacity-80"
            />
          </div>

          {/* Gönder Butonu */}
          <button
            type="submit"
            className="bg-[#3E6A8A] text-white font-bold rounded-full py-2 px-4 hover:bg-[#2C4D66] transition-all"
          >
            Post
          </button>
        </div>
      </div>
    </form>
  );
}
