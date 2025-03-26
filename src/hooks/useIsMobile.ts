"use client";

import { useState, useEffect } from "react";

/**
 * Ekran genişliği 768px altındaysa `true` döndüren basit hook.
 */
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    // Sayfa ilk açıldığında da kontrol edelim
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
}
