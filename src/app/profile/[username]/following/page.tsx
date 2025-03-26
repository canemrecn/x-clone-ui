"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface User {
  id: number;
  full_name: string;
  username: string;
  profile_image: string;
}

export default function FollowingPage() {
  const { username } = useParams() as { username: string };
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchFollowing() {
      try {
        const res = await fetch(`/api/users/following?username=${username}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch following.");
        }
        const data = await res.json();
        setFollowing(data.following);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    }
    fetchFollowing();
  }, [username]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
          {username}'s Following
        </h1>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : following.length === 0 ? (
          <p className="text-center">No following found.</p>
        ) : (
          <ul className="space-y-4">
            {following.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-4 p-4 bg-gray-100 rounded shadow"
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
                  <p className="font-bold text-gray-800">{user.full_name}</p>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      
    </div>
  );
}
