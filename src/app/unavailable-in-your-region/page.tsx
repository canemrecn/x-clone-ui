// src/app/unavailable-in-your-region/page.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function UnavailableInYourRegionPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white text-center px-6">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">
        Bölgesel Erişim Sınırlaması
      </h1>
      <p className="text-lg mb-4 max-w-xl">
        Undergo platformu şu anda yalnızca <strong>Türkiye Cumhuriyeti</strong> sınırları içinden erişime açıktır.
      </p>
      <p className="text-sm text-gray-400 mb-8 max-w-xl">
        Avrupa Birliği ülkelerinden gelen erişimler geçici olarak sınırlandırılmıştır. 
        GDPR temsilcimiz atandığında platform Avrupa’ya da açılacaktır.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition font-semibold"
      >
        Anasayfaya Dön
      </Link>
    </div>
  );
}
