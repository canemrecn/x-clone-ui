// src/components/AnaglyphWrapper.tsx
"use client";

import React from "react";
import { useEffect, useState } from "react";

interface AnaglyphWrapperProps {
  children: React.ReactNode;
  isVisible: boolean;
}

export default function AnaglyphWrapper({ children, isVisible }: AnaglyphWrapperProps) {
  const [enabled3D, setEnabled3D] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("enable3D");
    setEnabled3D(stored === "true");
  }, []);

  // Sadece 3D açık ve görünür gönderiyse efekt uygula
  const shouldApplyEffect = enabled3D && isVisible;

  return <div className={shouldApplyEffect ? "anaglyph-active-post" : ""}>{children}</div>;
}
