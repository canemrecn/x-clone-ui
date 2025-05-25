//src/app/arrangement/page.tsx
/*Bu dosya, kullanıcıların genel sıralamasını (puan bazlı) gösteren bir Next.js istemci bileşenidir. Sayfa yüklendiğinde /api/arrangement?all=1 
API'sine istek atarak tüm kullanıcıların sıralamasını çeker. Gelen verilerden her kullanıcı, sıralama numarası, profil fotoğrafı, adı, 
kullanıcı adı ve puanı ile birlikte liste halinde gösterilir. Liste öğelerine tıklanabilir bağlantılar eklenerek her kullanıcı profil 
sayfasına yönlendirme yapılır. Yüklenme sürecinde “Loading ranking...”, hata durumunda hata mesajı gösterilir. Arayüzde koyu renkli, 
responsive ve görsel olarak zengin bir tasarım kullanılmıştır.*/
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type UserData = {
  id: number;
  full_name: string;
  username: string;
  points: number;
  profile_image?: string;
};

export default function ArrangementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllUsers() {
      try {
        const res = await fetch("/api/arrangement?all=1");
        if (!res.ok) {
          throw new Error("Error fetching ranking");
        }
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err: any) {
        console.error("Arrangement fetch error:", err);
        setError(err.message || "Error fetching ranking");
      } finally {
        setLoading(false);
      }
    }
    fetchAllUsers();
  }, []);

  if (loading) {
    return (
      <p className="p-6 text-center text-gray-300 text-lg animate-pulse">
        Loading ranking...
      </p>
    );
  }

  if (error) {
    return (
      <p className="p-6 text-center text-red-400 font-semibold">
        {error}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 sm:p-10">
      <h1 className="text-3xl font-extrabold text-center mb-8 tracking-wide text-white">
        🏆 Overall Ranking
      </h1>

      {users.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">
          No users found.
        </p>
      ) : (
        <ul className="space-y-4 max-w-2xl mx-auto">
          {users.map((user, index) => (
            <Link key={user.id} href={`/${user.username}`}>
              <li className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700 rounded-xl shadow hover:ring-2 hover:ring-orange-500 transition-all cursor-pointer">
                <span className="font-bold text-lg text-yellow-400 w-6 text-center">
                  {index + 1}.
                </span>

                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 shadow-sm">
                  <Image
                    src={user.profile_image || "/icons/pp.png"}
                    alt={user.full_name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold text-white text-base leading-tight">
                    {user.full_name}
                  </span>
                  <span className="text-sm text-gray-400">@{user.username}</span>
                </div>

                <span className="ml-auto bg-gray-900 text-white px-3 py-1 text-sm font-bold rounded-full shadow">
                  {user.points} pts
                </span>
              </li>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
}
