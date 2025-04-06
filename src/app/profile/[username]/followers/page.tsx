//src/app/profile/[username]/followers/page.tsx
/*Bu dosya, bir kullanıcının takipçilerini (followers) görüntüleyen sayfayı oluşturur; URL'den username parametresini alarak /api/users/followers 
endpoint’ine istek gönderir, gelen verileri SWR ile çeker ve kullanıcının takipçilerini profil fotoğrafları, adları ve kullanıcı adlarıyla 
birlikte listeler; veri yoksa uygun mesaj gösterir.*/
"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie"; // Import js-cookie to access cookies

interface User {
  id: number;
  full_name: string;
  username: string;
  profile_image: string;
}

// Custom fetcher function using cookies
const fetcher = (url: string) => {
  const token = Cookies.get("token"); // Get the token from cookies
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

  // Fetch data using SWR and our custom fetcher
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
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6">
      <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md mb-8">
        {username}'s Followers
      </h1>
      {followers.length === 0 ? (
        <p className="text-center text-lg text-white">No followers found.</p>
      ) : (
        <ul className="space-y-4">
          {followers.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-800 to-gray-800 rounded shadow-md hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition-all"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={user.profile_image || "/icons/pp.png"}
                  alt={user.username}
                  width={48}
                  height={48}
                />
              </div>
              <div>
                <p className="font-bold text-white">{user.full_name}</p>
                <p className="text-sm text-white">@{user.username}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
