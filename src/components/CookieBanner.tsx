"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const logConsent = async (consentType: "all" | "necessary") => {
    try {
      await fetch("/api/cookie-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consentType,
          analytics: consentType === "all",
          marketing: consentType === "all",
        }),
      });
    } catch (err) {
      console.error("Çerez onayı API hatası:", err);
    }
  };

  const handleAcceptAll = async () => {
    Cookies.set("cookieConsent", "all", { expires: 365 });
    Cookies.set("analyticsConsent", "true", { expires: 365 });
    Cookies.set("marketingConsent", "true", { expires: 365 });
    setShowBanner(false);
    await logConsent("all");
  };

  const handleOnlyNecessary = async () => {
    Cookies.set("cookieConsent", "necessary", { expires: 365 });
    Cookies.set("analyticsConsent", "false", { expires: 365 });
    Cookies.set("marketingConsent", "false", { expires: 365 });
    setShowBanner(false);
    await logConsent("necessary");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-10 sm:right-10 z-50 p-4 sm:p-6 bg-gray-800 text-white rounded-xl shadow-lg border border-gray-600">
      <p className="text-sm mb-4">
        Bu site, temel işlevler ve isteğe bağlı analitik/pazarlama çerezleri kullanır.{" "}
        <a href="/cookies-policy" className="underline text-cyan-400 hover:text-cyan-300">
          Çerez politikamızı
        </a>{" "}
        inceleyin.
      </p>
      <div className="flex justify-end gap-4 flex-wrap">
        <button
          onClick={handleOnlyNecessary}
          className="px-4 py-2 text-sm rounded-lg border border-gray-500 hover:bg-gray-700 transition"
        >
          Sadece Zorunlu Olanlar
        </button>
        <button
          onClick={handleAcceptAll}
          className="px-4 py-2 text-sm rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition"
        >
          Tümünü Kabul Et
        </button>
      </div>
    </div>
  );
}
