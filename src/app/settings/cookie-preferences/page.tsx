// ✅ src/app/settings/cookie-preferences/page.tsx
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function CookiePreferencesPage() {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const analyticsConsent = Cookies.get("analyticsConsent") === "true";
    const marketingConsent = Cookies.get("marketingConsent") === "true";
    setAnalytics(analyticsConsent);
    setMarketing(marketingConsent);
  }, []);

  const handleSave = () => {
    Cookies.set("analyticsConsent", String(analytics), { expires: 365 });
    Cookies.set("marketingConsent", String(marketing), { expires: 365 });

    // cookieConsent anahtarını da yeniden güncelle
    const overall =
      analytics && marketing ? "all" : "necessary";
    Cookies.set("cookieConsent", overall, { expires: 365 });

    alert("Tercihleriniz kaydedildi.");
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-800 to-gray-700 text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Çerez Tercihlerini Yönet</h1>

      <div className="max-w-xl mx-auto space-y-6 bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center">
          <span>Analitik Çerezler</span>
          <input
            type="checkbox"
            checked={analytics}
            onChange={() => setAnalytics(!analytics)}
            className="w-5 h-5"
          />
        </div>

        <div className="flex justify-between items-center">
          <span>Pazarlama Çerezleri</span>
          <input
            type="checkbox"
            checked={marketing}
            onChange={() => setMarketing(!marketing)}
            className="w-5 h-5"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition"
        >
          Kaydet
        </button>
      </div>
    </div>
  );
}
