// src/components/Video.tsx
"use client";

import { IKVideo } from "imagekitio-next";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

type VideoProps = {
  path: string;
  className?: string;
};

export default function Video({ path, className }: VideoProps) {
  return (
    <IKVideo
      urlEndpoint={urlEndpoint || ""}
      path={path}
      className={className}
      transformation={[{ width: "1920", height: "1080", q: "90" }]}
      controls
    >
      Video
    </IKVideo>
  );
}
