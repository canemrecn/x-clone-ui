//src/app/profile/[username]/following/page.tsx
/*Bu dosya, belirli bir kullanıcının takip ettiği kişileri (following) listeleyen bir sayfa oluşturur; URL'den username parametresini alarak 
/api/users/following API'sine istek gönderir, gelen kullanıcı verilerini SWR ile çeker ve bu kullanıcıları profil fotoğrafı, adı ve kullanıcı 
adıyla birlikte listeler; veri yoksa "No following found" mesajı gösterir.*/
"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Image from "next/image";

const fetcher = (url: string) =>
  fetch(url, {
    credentials: "include",
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`Error fetching following: ${res.status}`);
    }
    return res.json();
  });

interface User {
  id: number;
  full_name: string;
  username: string;
  profile_image: string;
}

export default function FollowingPage() {
  const { username } = useParams() as { username: string };

  const { data, error } = useSWR<{ following: User[] }>(
    `/api/users/following?username=${username}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (!data && !error) {
    return <p className="text-center text-white">Loading...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-white">
        {error.message || "Error fetching following"}
      </p>
    );
  }

  const following = data?.following ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f2e] via-[#1a1a40] to-[#0f3460] text-white p-6">
      <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-[#4b6cb7] to-[#182848] text-transparent bg-clip-text mb-10 tracking-wide">
        {username}'s Following
      </h1>
      {following.length === 0 ? (
        <p className="text-center text-lg">No following found.</p>
      ) : (
        <ul className="space-y-6 max-w-3xl mx-auto">
          {following.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-4 p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-inner">
                <Image
                  src={user.profile_image || "/icons/pp.png"}
                  alt={user.username}
                  width={56}
                  height={56}
                />
              </div>
              <div>
                <p className="text-lg font-semibold">{user.full_name}</p>
                <p className="text-sm text-gray-300">@{user.username}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
