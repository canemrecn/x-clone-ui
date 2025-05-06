// src/components/AdPlaceholder.tsx
/* Bu dosya, dinamik genişlik (width) ve yükseklik (height) değerleri alabilen,
   görsel ve metin içeren bir reklam bileşeni olan AdPlaceholder bileşenini tanımlar.
   İçeriğinde bir logo ve "Reklam Alanı: Yeni Özellikleri Keşfedin!" metni bulunur ve
   bu metne tıklanıldığında kullanıcı /advertise sayfasına yönlendirilir.
   Bu bileşen, farklı alanlarda kolayca kullanılabilecek şekilde esnek ve şık bir reklam kutusu sunar.
*/
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * AdPlaceholder: Advertisement component example.
 * - Allows dynamic width and height through props.
 */
interface AdPlaceholderProps {
  width?: number | string;  // Example: 200, "300px", "50%"
  height?: number | string; // Example: 200, "300px", "50%"
}

export default function AdPlaceholder({
  width = 330,
  height = 130,
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
          src="/icons/logo22.png"
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
