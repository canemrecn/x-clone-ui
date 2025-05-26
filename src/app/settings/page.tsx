//src/app/settings/page.tsx
/*Bu dosya, kullanıcıya hesap ayarlarıyla ilgili farklı işlemleri yapabileceği bir ayarlar menüsü (SettingsPage) sunar; sayfa 
üzerinde "Profili Düzenle", "Hesap Bağlantıları", "Şifre Değiştirme", "Engellenenler" ve "Hesabı Silme" başlıklarında bağlantılar 
yer alır ve kullanıcı bu seçeneklere tıklayarak ilgili ayar sayfalarına yönlendirilir.*/
//src/app/settings/page.tsx
/*Bu dosya, kullanıcıya hesap ayarlarıyla ilgili farklı işlemleri yapabileceği bir ayarlar menüsü (SettingsPage) sunar.*/
"use client";

import Link from "next/link";
import React from "react";
import Cookies from "js-cookie";
import LegalComplianceBadges from "@/components/LegalComplianceBadges";

const SettingsPage = React.memo(function SettingsPage() {
  const token = Cookies.get("token");

  return (
    <div className="max-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#2c2c3e] text-white pt-24 pb-20 px-6">
      <h1 className="text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
        Hesap Ayarları
      </h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { href: "/settings/edit-profile", label: "👤 Profili Düzenle" },
          { href: "/settings/change-password", label: "🔐 Şifre Değiştir" },
          { href: "/settings/blocked", label: "🚫 Engellediklerim" },
          { href: "/settings/dm-request", label: "📥 DM Veri Talebi" },
          { href: "/settings/export-data", label: "📦 Tüm Verilerimi İndir" },
          { href: "/settings/kvkk-request", label: "📄 KVKK Başvuru Formu" },
          { href: "/settings/cookie-preferences", label: "🍪 Çerez Tercihleri" },
          { href: "/settings/kvkk-history", label: "📜 KVKK Başvuru Geçmişim" },
          { href: "/settings/delete-account", label: "❌ Hesabımı Sil" },
        ].map(({ href, label }) => (
          <li key={href}>
            <Link href={href}>
              <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg border border-gray-700 hover:border-transparent cursor-pointer">
                <span className="text-lg font-semibold tracking-wide">{label}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-12">
        <LegalComplianceBadges />
      </div>
    </div>
  );
});

export default SettingsPage;
