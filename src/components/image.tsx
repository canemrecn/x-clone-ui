//src/components/image.tsx
/*Bu dosya, ImageKit ile entegre çalışan Image1 adlı özel bir görsel bileşeni tanımlar; verilen path ve alt bilgilerine göre 
bir görseli sayfada gösterir, görsele tıklandığında ise ekran ortasında büyük boyutlu bir modal açarak detaylı önizleme sunar. 
Geçersiz veya eksik görsel yolları için varsayılan bir görsel kullanılır ve görseller IKImage bileşeniyle optimize şekilde yüklenir.*/
"use client";

import React, { useState } from "react";
import { IKImage } from "imagekitio-next";

interface ImageProps {
  path: string;
  alt: string;
  className?: string;
}

export default function Image1({ path, alt, className }: ImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT || "";
  const fallbackImage = "/default-placeholder.jpg";

  let fixedPath = path ? path.trim() : "";
  if (!fixedPath || fixedPath === "null" || fixedPath === "undefined") {
    fixedPath = fallbackImage;
  }

  const imageUrl =
    fixedPath.startsWith("http") || fixedPath.startsWith("/")
      ? fixedPath
      : `${urlEndpoint}${fixedPath}`;

  console.log("Yüklenmeye çalışılan görsel URL:", imageUrl);

  return (
    <div className="w-full max-w-[600px] max-h-[400px] flex justify-center items-center overflow-hidden bg-[#7E7E7E] rounded-lg">
      {/* Resme tıklayınca modal aç */}
      <IKImage
        urlEndpoint={urlEndpoint}
        src={imageUrl}
        alt={alt}
        width="600"
        height="400"
        crossOrigin="use-credentials" // HTTP‑only çerezler için eklenmiştir.
        className={`w-full h-full object-contain rounded-lg cursor-pointer ${className}`}
        onClick={() => setIsOpen(true)}
      />

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#000000] bg-opacity-75 flex justify-center items-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full p-4 bg-[#7E7E7E] text-[#D3DADF] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapatma Butonu */}
            <button
              className="absolute top-2 right-2 text-[#D3DADF] bg-[#7E7E7E] px-3 py-1 rounded-full transition hover:bg-[#0F0F0F]"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>

            {/* Büyük Görsel */}
            <IKImage
              urlEndpoint={urlEndpoint}
              src={imageUrl}
              alt={alt}
              width="900"
              height="600"
              crossOrigin="use-credentials" // HTTP‑only çerezler için eklenmiştir.
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
