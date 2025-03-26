"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Image from "next/image";

interface User {
  id: number;
  full_name: string;
  username: string;
  profile_image: string;
}

// Basit fetcher fonksiyonu (Hata yönetimi ile birlikte)
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`Error fetching following: ${res.status}`);
    }
    return res.json();
  });

export default function FollowingPage() {
  const { username } = useParams() as { username: string };

  // SWR ile veriyi çekiyoruz
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
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6">
      <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md mb-8">
        {username}'s Following
      </h1>
      {following.length === 0 ? (
        <p className="text-center text-lg">No following found.</p>
      ) : (
        <ul className="space-y-4 max-w-full sm:max-w-2xl mx-auto">
          {following.map((user) => (
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
