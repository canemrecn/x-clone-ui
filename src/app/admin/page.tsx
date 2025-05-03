// src/app/admin/page.tsx
/*Bu dosya, admin rolüne sahip kullanıcıların erişebileceği bir admin paneli sayfasıdır. 
Kullanıcı admin değilse, anasayfaya yönlendirilir. */

import Link from "next/link";
import { getAuthUser } from "@/utils/getAuthUser";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const user = await getAuthUser();

  // Kullanıcı admin değilse anasayfaya yönlendir
  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="max-w-6xl w-full h-[750px] overflow-y-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Admin Paneli</h1>
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
}
