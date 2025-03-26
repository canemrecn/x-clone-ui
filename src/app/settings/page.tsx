"use client";

import Link from "next/link";
import React from "react";

const SettingsPage = React.memo(function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md">
        Ayarlar
      </h1>
      <ul className="space-y-6">
        <li>
          <Link href="/settings/edit-profile">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition cursor-pointer">
              <span className="text-lg font-semibold">
                Profili Düzenle
              </span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/settings/account-links">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition cursor-pointer">
              <span className="text-lg font-semibold">
                Hesap Bağlantıları
              </span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/settings/change-password">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition cursor-pointer">
              <span className="text-lg font-semibold">
                Şifre Değiştirme
              </span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/settings/blocked">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition cursor-pointer">
              <span className="text-lg font-semibold">
                Engellenenler
              </span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/settings/delete-account">
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition cursor-pointer">
              <span className="text-lg font-semibold">
                Hesabı Silme
              </span>
            </div>
          </Link>
        </li>
      </ul>
    </div>
  );
});

export default SettingsPage;
