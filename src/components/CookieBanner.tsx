"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "false");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-10 sm:right-10 z-50 p-4 sm:p-6 bg-gray-800 text-white rounded-xl shadow-lg border border-gray-500">
      <p className="text-sm mb-4">
        Web sitemiz, deneyiminizi geliştirmek için çerezler kullanır. Detaylar için{" "}
        <a href="/privacy-policy" className="underline text-cyan-400 hover:text-cyan-300">
          gizlilik politikamızı
        </a>{" "}
        inceleyin.
      </p>
      <div className="flex justify-end gap-4">
        <button
          onClick={handleDecline}
          className="px-4 py-2 text-sm rounded-lg border border-gray-500 hover:bg-gray-700 transition"
        >
          Reddet
        </button>
        <button
          onClick={handleAccept}
          className="px-4 py-2 text-sm rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition"
        >
          Kabul Et
        </button>
      </div>
    </div>
  );
}
