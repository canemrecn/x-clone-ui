"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * AdBar: Sabit konumlu reklam barı
 * - En üstte fixed olarak yer alır.
 * - z-[9999] ile en üst katmanda görünür.
 * - Arka plan, metin ve görseller ayarlanmıştır.
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
