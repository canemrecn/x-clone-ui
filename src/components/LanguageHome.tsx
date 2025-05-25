// src/components/LanguageHome.tsx
/* 
Bu dosya, lang parametresine göre filtrelenmiş gönderileri listeleyen ve 
kullanıcıların o dile özel gönderi paylaşmasını sağlayan LanguageHome bileşenini tanımlar.
Üstte dil başlığını gösterir, ardından Share bileşeniyle gönderi paylaşım alanı sunar ve 
Feed bileşeniyle ilgili dildeki gönderileri kullanıcıya gösterir.
HTTP‑only çerezlerin gönderilmesi için Share ve Feed bileşenleri içerisindeki fetch çağrılarında 
{ credentials: "include" } kullanılmıştır.
*/
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
      <Share/>
      {/* Gönderi akışı */}
      <Feed/>
    </div>
  );
});

export default LanguageHome;
