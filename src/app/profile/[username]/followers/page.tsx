//src/app/profile/[username]/followers/page.tsx
/*Bu dosya, bir kullanıcının takipçilerini (followers) görüntüleyen sayfayı oluşturur; URL'den username parametresini alarak /api/users/followers 
endpoint’ine istek gönderir, gelen verileri SWR ile çeker ve kullanıcının takipçilerini profil fotoğrafları, adları ve kullanıcı adlarıyla 
birlikte listeler; veri yoksa uygun mesaj gösterir.*/
//src/app/profile/[username]/followers/page.tsx
"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";

interface User {
  id: number;
  full_name: string;
  username: string;
  profile_image: string;
}

const fetcher = (url: string) => {
  const token = Cookies.get("token");
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`Error fetching followers: ${res.status}`);
    }
    return res.json();
  });
};

export default function FollowersPage() {
  const { username } = useParams() as { username: string };
  const { data, error } = useSWR<{ followers: User[] }>(
    `/api/users/followers?username=${username}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (!data && !error) {
    return <p className="text-center text-white">Loading...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-white">
        {error.message || "Error fetching followers"}
      </p>
    );
  }

  const followers = data?.followers ?? [];

  return (
    <div className="max-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white p-6 pt-24 pb-20">
      <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-[#4b6cb7] to-[#182848] text-transparent bg-clip-text mb-10 tracking-wide">
        {username}'s Followers
      </h1>
      {followers.length === 0 ? (
        <p className="text-center text-lg text-white">No followers found.</p>
      ) : (
        <ul className="space-y-6 max-w-3xl mx-auto">
          {followers.map((user) => (
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
