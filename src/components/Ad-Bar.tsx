// src/components/Ad-Bar.tsx
/* Bu dosya, sayfanın en üstünde sabit (fixed) olarak konumlanan AdBar adlı bir reklam bileşenini tanımlar.
   İçinde bir logo ve “Reklam Alanı: Yeni Özellikleri Keşfedin!” metni yer alır; 
   bu metne tıklanıldığında /advertise sayfasına yönlendirme yapılır.
   Tasarımıyla dikkat çeken bu bar, yüksek z-index (z-[9999]) sayesinde tüm içeriklerin üzerinde görünür
   ve kullanıcıyı yeni özellikler hakkında bilgilendirmek için kullanılır. */
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * AdBar: Fixed-position advertisement bar
 * - Positioned at the top of the page with a high z-index for visibility.
 * - Background, text, and images are styled appropriately.
 */
export default function AdBar() {
  return (
    <div className="fixed top-0 left-0 w-full z-[9999] bg-gradient-to-br from-gray-800 to-gray-700 text-white py-2 px-4 shadow-md flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Image
          src="/icons/logom2.png"
          alt="Ad Logo"
          width={30}
          height={30}
          className="object-contain"
        />
        <Link href="/advertise">
          <span className="cursor-pointer font-semibold hover:text-orange-400 transition">
            Reklam Alanı: Yeni Özellikleri Keşfedin!
          </span>
        </Link>
      </div>
    </div>
  );
}
