"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * AdPlaceholder: Reklam bileşeni örneği.
 * - width ve height prop'larını alarak boyutunu dinamik ayarlayabiliriz.
 */
interface AdPlaceholderProps {
  width?: number | string;  // Ör: 200, "300px", "50%"
  height?: number | string; // Ör: 200, "300px", "50%"
}

export default function AdPlaceholder({
  width = 520,
  height = 170,
}: AdPlaceholderProps) {
  return (
    <div
      className="bg-gradient-to-br from-gray-800 to-gray-700 text-white border-2 border-white flex items-center justify-center rounded shadow-md mt-1"
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    >
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
