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

    const overall = analytics && marketing ? "all" : "necessary";
    Cookies.set("cookieConsent", overall, { expires: 365 });

    alert("Tercihleriniz kaydedildi.");
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#1e1e2f] via-[#25253a] to-[#2c2c3e] text-white pt-24 pb-20">
      <h1 className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400 mb-8">
        🍪 Çerez Tercihlerini Yönet
      </h1>

      <div className="max-w-xl mx-auto flex flex-col gap-6 bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-700">
        <div className="flex justify-between items-center text-lg">
          <span className="text-gray-200">📈 Analitik Çerezler</span>
          <input
            type="checkbox"
            checked={analytics}
            onChange={() => setAnalytics(!analytics)}
            className="w-6 h-6 rounded-md accent-purple-600 border-gray-500"
          />
        </div>

        <div className="flex justify-between items-center text-lg">
          <span className="text-gray-200">🎯 Pazarlama Çerezleri</span>
          <input
            type="checkbox"
            checked={marketing}
            onChange={() => setMarketing(!marketing)}
            className="w-6 h-6 rounded-md accent-purple-600 border-gray-500"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold tracking-wide transition"
        >
          💾 Kaydet
        </button>
      </div>
    </div>
  );
}
