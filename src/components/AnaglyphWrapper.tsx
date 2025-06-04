// src/components/AnaglyphWrapper.tsx
// src/components/AnaglyphWrapper.tsx

import React from "react";

interface AnaglyphWrapperProps {
  children: React.ReactNode;
  postId?: number;
  activePostId?: number | null;
  isActive?: boolean; // ✅ EKLENDİ
}

export default function AnaglyphWrapper({ children, postId, activePostId, isActive }: AnaglyphWrapperProps) {
  const active = isActive ?? (postId === activePostId); // fallback olarak hesaplayabiliriz

  return (
    <div
      className={`relative transition-transform duration-500 ${
        active
          ? "transform scale-[1.02] contrast-125"
          : "grayscale opacity-60 blur-[0.5px] scale-[0.97]"
      }`}
      style={{
        perspective: active ? "1000px" : undefined,
        transformStyle: active ? "preserve-3d" : undefined,
      }}
    >
      {children}
    </div>
  );
}
