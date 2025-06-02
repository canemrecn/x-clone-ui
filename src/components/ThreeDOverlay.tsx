// src/components/ThreeDOverlay.tsx
"use client";

import React, { useEffect, useRef } from "react";
import html2canvas from "html2canvas";

export default function ThreeDOverlay() {
  const redCanvasRef = useRef<HTMLCanvasElement>(null);
  const cyanCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const iframe = document.createElement("iframe");
    iframe.src = window.location.href;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.position = "absolute";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    iframe.style.zIndex = "-1";
    document.body.appendChild(iframe);

    const captureAndRender = () => {
      html2canvas(iframe.contentDocument?.body as HTMLElement).then((screenshot) => {
        const redCanvas = redCanvasRef.current;
        const cyanCanvas = cyanCanvasRef.current;
        if (!redCanvas || !cyanCanvas) return;

        const redCtx = redCanvas.getContext("2d")!;
        const cyanCtx = cyanCanvas.getContext("2d")!;

        redCanvas.width = screenshot.width;
        redCanvas.height = screenshot.height;
        cyanCanvas.width = screenshot.width;
        cyanCanvas.height = screenshot.height;

        // RED (left eye)
        redCtx.drawImage(screenshot, -2, 0);
        const redImage = redCtx.getImageData(0, 0, redCanvas.width, redCanvas.height);
        for (let i = 0; i < redImage.data.length; i += 4) {
          redImage.data[i + 1] = 0;
          redImage.data[i + 2] = 0;
        }
        redCtx.putImageData(redImage, 0, 0);

        // CYAN (right eye)
        cyanCtx.drawImage(screenshot, 2, 0);
        const cyanImage = cyanCtx.getImageData(0, 0, cyanCanvas.width, cyanCanvas.height);
        for (let i = 0; i < cyanImage.data.length; i += 4) {
          cyanImage.data[i + 0] = 0;
        }
        cyanCtx.putImageData(cyanImage, 0, 0);
      });
    };

    setTimeout(captureAndRender, 1000);

    return () => {
      document.body.removeChild(iframe);
    };
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999 }}>
      <canvas ref={redCanvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
      <canvas ref={cyanCanvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
    </div>
  );
}
