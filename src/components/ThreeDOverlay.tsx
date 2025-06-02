"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas"; // 🔥 Doğru import

export default function ThreeDOverlay() {
  const [enabled, setEnabled] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const renderAnaglyph = async () => {
      const target = document.body;
      const canvas = await html2canvas(target, {
        backgroundColor: null,
        scale: 1,
        logging: false,
        useCORS: true,
      });

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      const red = ctx.getImageData(0, 0, width, height);
      const cyan = ctx.getImageData(0, 0, width, height);

      for (let i = 0; i < red.data.length; i += 4) {
        red.data[i + 1] = 0; // G
        red.data[i + 2] = 0; // B
      }

      for (let i = 0; i < cyan.data.length; i += 4) {
        cyan.data[i] = 0; // R
      }

      const final = document.createElement("canvas");
      final.width = width;
      final.height = height;
      const finalCtx = final.getContext("2d");
      if (!finalCtx) return;

      finalCtx.putImageData(red, -4, 0); // sol görüntü (kırmızı)
      finalCtx.globalCompositeOperation = "lighter";
      finalCtx.putImageData(cyan, 4, 0); // sağ görüntü (camgöbeği)

      if (overlayRef.current) {
        overlayRef.current.innerHTML = "";
        overlayRef.current.appendChild(final);
      }
    };

    renderAnaglyph();
  }, [enabled]);

  return (
    <div
      ref={overlayRef}
      className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[9999]"
    />
  );
}
