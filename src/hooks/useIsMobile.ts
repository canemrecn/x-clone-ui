//src/hooks/uselsMobile.ts
/*Bu dosya, useIsMobile adlı özel bir React hook'u tanımlar; ekran genişliği 768 pikselin altına düştüğünde 
true döndürerek cihazın mobil olup olmadığını belirlemeye yarar ve pencere boyutu değiştikçe bu durumu 
dinamik olarak günceller.*/
"use client";

import { useState, useEffect } from "react";

/**
 * Ekran genişliği 768px altındaysa `true` döndüren basit hook.
 */
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
  function handleResize() {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
    }
  }

  if (typeof window !== "undefined") {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }
}, []);


  return isMobile;
}
