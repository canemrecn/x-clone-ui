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

const AdminPage = React.memo(function AdminPage() {
  const token = Cookies.get("token");

  return (
      <div className="max-w-6xl w-full h-[750px] overflow-y-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Admin Paneli
        </h1>
        <ul className="space-y-4">
          <li>
            <Link href="/admin/archive">
              <div className="p-4 bg-gray-700 hover:bg-gray-600 rounded-md transition cursor-pointer">
                <span className="text-base font-semibold">Arşiv</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/admin/deleted-users">
              <div className="p-4 bg-gray-700 hover:bg-gray-600 rounded-md transition cursor-pointer">
                <span className="text-base font-semibold">Silinen Kullanıcılar Listesi</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/admin/delete-comment">
              <div className="p-4 bg-gray-700 hover:bg-gray-600 rounded-md transition cursor-pointer">
                <span className="text-base font-semibold">Yorum Sil</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/admin/delete-post">
              <div className="p-4 bg-gray-700 hover:bg-gray-600 rounded-md transition cursor-pointer">
                <span className="text-base font-semibold">Gönderi Sil</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/admin/dm-export">
              <div className="p-4 bg-gray-700 hover:bg-gray-600 rounded-md transition cursor-pointer">
                <span className="text-base font-semibold">DM'den Dışarı Aktarma</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/admin/pending">
              <div className="p-4 bg-gray-700 hover:bg-gray-600 rounded-md transition cursor-pointer">
                <span className="text-base font-semibold">Askıya Alma</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/admin/privacy-requests">
              <div className="p-4 bg-gray-700 hover:bg-gray-600 rounded-md transition cursor-pointer">
                <span className="text-base font-semibold">Gizlilik Talebi</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/admin/warnings">
              <div className="p-4 bg-gray-700 hover:bg-gray-600 rounded-md transition cursor-pointer">
                <span className="text-base font-semibold">Uyarı Alan Gönderiler</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/admin/cookie-logs">
              <div className="p-4 bg-gray-700 hover:bg-gray-600 rounded-md transition cursor-pointer">
                <span className="text-base font-semibold">Çerez Günlükleri</span>
              </div>
            </Link>
          </li>
        </ul>
      </div>

  );
});

export default AdminPage;
