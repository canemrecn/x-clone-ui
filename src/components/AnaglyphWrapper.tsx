// src/components/AnaglyphWrapper.tsx
"use client";

import React from "react";

interface AnaglyphWrapperProps {
  children: React.ReactNode;
  isVisible: boolean;
}

export default function AnaglyphWrapper({ children, isVisible }: AnaglyphWrapperProps) {
  // Anlık olarak body'de anaglyph sınıfı var mı kontrol et
  const is3DEnabled = typeof window !== "undefined" && document.body.classList.contains("anaglyph");

  const shouldApplyEffect = is3DEnabled && isVisible;

  return <div className={shouldApplyEffect ? "anaglyph-active-post" : ""}>{children}</div>;
}
