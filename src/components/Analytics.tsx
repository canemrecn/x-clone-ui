// src/components/Analytics.tsx
"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function Analytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const analyticsConsent = localStorage.getItem("analyticsConsent");
    if (analyticsConsent === "true") {
      setEnabled(true);
    }
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXX');
        `}
      </Script>
    </>
  );
}
