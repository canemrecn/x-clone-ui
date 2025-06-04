// src/components/FrameOverlay.tsx
"use client";

export default function FrameOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[998]">
      <div className="absolute top-0 left-0 w-full h-2 bg-black" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-black" />
      <div className="absolute top-0 left-0 h-full w-2 bg-black" />
      <div className="absolute top-0 right-0 h-full w-2 bg-black" />
    </div>
  );
}
