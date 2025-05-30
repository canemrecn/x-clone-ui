"use client";
import { useEffect, useState } from "react";

export default function Toggle3DEffect() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (enabled) {
      document.body.classList.add("anaglyph-effect");
    } else {
      document.body.classList.remove("anaglyph-effect");
    }
  }, [enabled]);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className="fixed bottom-4 right-4 z-50 bg-black/80 text-white px-4 py-2 rounded-md border border-white shadow-lg"
    >
      {enabled ? "3D KAPAT" : "3D AÇ"}
    </button>
  );
}
