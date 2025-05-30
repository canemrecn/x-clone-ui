// src/components/Toggle3DEffect.tsx
"use client";
import { useEffect, useState } from "react";

export default function Toggle3DEffect() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const body = document.body;
    if (enabled) {
      body.classList.add("anaglyph-effect");
      body.classList.add("anaglyph-overlay");
    } else {
      body.classList.remove("anaglyph-effect");
      body.classList.remove("anaglyph-overlay");
    }
  }, [enabled]);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className="fixed bottom-4 right-4 z-[99999] bg-black/80 text-white px-4 py-2 rounded-md border border-white shadow-lg"
    >
      {enabled ? "3D KAPAT" : "3D AÇ"}
    </button>
  );
}
