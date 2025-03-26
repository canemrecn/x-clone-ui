"use client";

import React from "react";
import Share from "./Share";
import Feed from "./Feed";

interface LanguageHomeProps {
  lang: string;
}

const LanguageHome = React.memo(function LanguageHome({ lang }: LanguageHomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 sm:p-6 md:p-1">
      <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-gray-800 to-gray-800 p-2 rounded shadow-md">
        {lang.toUpperCase()} Posts
      </h1>
      {/* Gönderi paylaşma alanı */}
      <Share lang={lang} />
      {/* Gönderi akışı */}
      <Feed lang={lang} />
    </div>
  );
});

export default LanguageHome;
