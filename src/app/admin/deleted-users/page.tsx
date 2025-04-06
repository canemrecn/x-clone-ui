// src/app/admin/deleted-users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DeletedUser {
  id: number;
  full_name: string;
  username: string;
  email: string;
  deleted_at: string;
  reason: string | null;
}

export default function DeletedUsersPage() {
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchDeletedUsers = async () => {
      try {
        const res = await fetch("/api/admin/deleted-users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // HttpOnly cookie ile çalışmak için
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Kullanıcı verileri alınamadı");
        }

        const { users } = await res.json();
        setDeletedUsers(users);
      } catch (err: any) {
        setError(err.message || "Hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Silinen Hesaplar</h1>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-600">
            <thead>
              <tr className="bg-gray-900">
                <th className="p-3 text-left">Ad Soyad</th>
                <th className="p-3 text-left">Kullanıcı Adı</th>
                <th className="p-3 text-left">E-posta</th>
                <th className="p-3 text-left">Silinme Nedeni</th>
                <th className="p-3 text-left">Silinme Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {deletedUsers.map((user, index) => (
                <tr
                  key={`${user.id}-${user.deleted_at}-${index}`}
                  className="border-t border-gray-600 hover:bg-gray-800"
                >
                  <td className="p-3">{user.full_name}</td>
                  <td className="p-3">@{user.username}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.reason || "Belirtilmedi"}</td>
                  <td className="p-3">{new Date(user.deleted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>

          </table>
          <div className="flex justify-end gap-4 mb-4">
            <a
              href="/api/admin/deleted-users/export?format=pdf"
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              PDF İndir
            </a>
          </div>
        </div>

      )}
    </div>
  );
}
