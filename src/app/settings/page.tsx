// src/app/settings/page.tsx
"use client";

import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">

        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
          Ayarlar
        </h1>
        <ul className="space-y-6">
          <li>
            <Link href="/settings/edit-profile">
              <div className="p-6 bg-gray-100 rounded-xl shadow hover:bg-gray-200 transition cursor-pointer">
                <span className="text-lg font-semibold text-gray-700">
                  Profili Düzenle
                </span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/settings/account-links">
              <div className="p-6 bg-gray-100 rounded-xl shadow hover:bg-gray-200 transition cursor-pointer">
                <span className="text-lg font-semibold text-gray-700">
                  Hesap Bağlantıları
                </span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/settings/change-password">
              <div className="p-6 bg-gray-100 rounded-xl shadow hover:bg-gray-200 transition cursor-pointer">
                <span className="text-lg font-semibold text-gray-700">
                  Şifre Değiştirme
                </span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/settings/delete-account">
              <div className="p-6 bg-red-100 rounded-xl shadow hover:bg-red-200 transition cursor-pointer">
                <span className="text-lg font-semibold text-red-600">
                  Hesabı Silme
                </span>
              </div>
            </Link>
          </li>
        </ul>

    </div>
  );
}
