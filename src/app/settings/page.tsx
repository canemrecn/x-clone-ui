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
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white pt-20 pb-20">
      <h1 className="text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md">
        Ayarlar
      </h1>
      <ul className="space-y-6">
        <li>
          <Link href="/settings/edit-profile">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition cursor-pointer">
              <span className="text-lg font-semibold">Profili Düzenle</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/settings/change-password">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition cursor-pointer">
              <span className="text-lg font-semibold">Şifre Değiştir</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/settings/blocked">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition cursor-pointer">
              <span className="text-lg font-semibold">Engellediklerim</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/settings/dm-request">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition cursor-pointer">
              <span className="text-lg font-semibold">DM Veri Talebi</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/settings/export-data">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition cursor-pointer">
              <span className="text-lg font-semibold">Tüm Verilerimi İndir(Gönderiler ve Yorumlar)</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/settings/kvkk-request">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition cursor-pointer">
              <span className="text-lg font-semibold">KVKK Başvuru Formu</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/settings/cookie-preferences">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition cursor-pointer">
              <span className="text-lg font-semibold">Çerez Tercihleri</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/settings/kvkk-history">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow hover:from-gray-700 hover:to-gray-600 transition cursor-pointer">
              <span className="text-lg font-semibold">KVKK Başvuru Geçmişim</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/settings/delete-account">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition cursor-pointer">
              <span className="text-lg font-semibold">Hesabımı Sil</span>
            </div>
          </Link>
        </li>
      </ul>
      <LegalComplianceBadges />
    </div>
  );
});

export default SettingsPage;