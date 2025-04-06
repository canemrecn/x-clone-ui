//src/components/Video.tsx
/*Bu dosya, bir görsel (image) veya video (video) içeriğini kullanıcıya gösteren ve üzerine tıklanınca büyütülmüş 
modal içinde açılmasını sağlayan Media adında çok amaçlı bir medya bileşeni sunar; medya dosyasının URL'sini 
doğru biçimde işler, image tipindeyse IKImage bileşeniyle gösterir, video ise HTML video etiketiyle oynatır ve 
her ikisi de tıklanabilir şekilde modal açılımıyla desteklenir.*/
"use client";

import React, { useState } from "react";
import { IKImage } from "imagekitio-next";

interface MediaProps {
  path: string;
  alt: string;
  type: "image" | "video";
  className?: string;
}

export default function Media({ path, alt, type, className }: MediaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT || "";
  const fallbackImage = "/default-placeholder.jpg";

  let fixedPath = path ? path.trim() : "";
  if (!fixedPath || fixedPath === "null" || fixedPath === "undefined") {
    fixedPath = fallbackImage;
  }

  const mediaUrl =
    fixedPath.startsWith("http") || fixedPath.startsWith("/")
      ? fixedPath
      : `${urlEndpoint}${fixedPath}`;

  return (
    <div className="w-full max-w-[600px] max-h-[400px] flex justify-center items-center overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg">
      {type === "image" ? (
        <IKImage
          urlEndpoint={urlEndpoint}
          src={mediaUrl}
          alt={alt}
          width="600"
          height="400"
          className={`w-full h-full object-contain rounded-lg cursor-pointer ${className}`}
          onClick={() => setIsOpen(true)}
        />
      ) : (
        <video
          src={mediaUrl}
          controls
          className="w-full h-full object-contain rounded-lg cursor-pointer"
          onClick={() => setIsOpen(true)}
        />
      )}

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-lg w-full p-4 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {type === "image" ? (
              <IKImage
                urlEndpoint={urlEndpoint}
                src={mediaUrl}
                alt={alt}
                width="500"
                height="500"
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <video src={mediaUrl} controls className="w-full h-auto rounded-lg" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
