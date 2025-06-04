// src/components/AnaglyphWrapper.tsx
"use client";

import React from "react";
import clsx from "clsx";

interface AnaglyphWrapperProps {
  children: React.ReactNode;
  postId: number;
  activePostId: number | null;
}

export default function AnaglyphWrapper({
  children,
  postId,
  activePostId,
}: AnaglyphWrapperProps) {
  const isActive = postId === activePostId;

  return (
    <div
      className={clsx(
        "relative transition-transform duration-500",
        isActive ? "anaglyph-active-post" : ""
      )}
    >
      {children}
    </div>
  );
}
