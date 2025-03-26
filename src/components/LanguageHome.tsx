// src/components/LanguageHome.tsx
"use client";

import Share from "./Share";
import Feed from "./Feed";

interface LanguageHomeProps {
  lang: string;
}

export default function LanguageHome({ lang }: LanguageHomeProps) {
  return (
    <div className="min-h-screen bg-[#cae1ff] text-black p-4 sm:p-6 md:p-1">
      <h1 className="text-3xl font-bold mb-4 text-center">
        {lang.toUpperCase()} Posts
      </h1>

      {/* Gönderi paylaşma alanı */}
      <Share lang={lang} />

      {/* Gönderi akışı */}
      <Feed lang={lang} />
    </div>
  );
}
