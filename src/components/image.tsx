// src/components/image.tsx
"use client";

import { IKImage } from "imagekitio-next";

type ImageProps = {
  path: string;
  w?: number;
  h?: number;
  alt: string;
  className?: string;
  tr?: boolean;
};

export default function Image1({ path, w, h, alt, className, tr }: ImageProps) {
  const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT || "";

  if (tr) {
    return (
      <IKImage
        urlEndpoint={urlEndpoint}
        path={path}
        alt={alt}
        className={className}
        transformation={[
          {
            width: w ? `${w}` : "600",
            height: h ? `${h}` : "400",
          },
        ]}
        lqip={{ active: true, quality: 20 }}
      />
    );
  } else {
    return (
      <IKImage
        urlEndpoint={urlEndpoint}
        path={path}
        alt={alt}
        className={className}
        width={w}
        height={h}
        lqip={{ active: true, quality: 20 }}
      />
    );
  }
}
