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
      <p className="p-4 text-center text-white font-semibold">
        Loading ranking...
      </p>
    );
  }

  if (error) {
    return (
      <p className="p-4 text-center text-white font-semibold">
        {error}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md">
        Overall Ranking
      </h1>

      {users.length === 0 ? (
        <p className="mt-4 text-center text-base sm:text-lg text-white">
          No users found.
        </p>
      ) : (
        <ul className="mt-6 space-y-4 max-w-full sm:max-w-2xl mx-auto bg-gradient-to-br from-gray-800 to-gray-800 p-4 shadow-2xl rounded-xl border border-gray-300">
          {users.map((user, index) => (
            <Link key={user.id} href={`/${user.username}`}>
              <li className="flex items-center gap-3 p-3 border-b border-gray-300 bg-gradient-to-br from-gray-800 to-gray-800 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 rounded-lg transition-all">
                <span className="font-bold text-base sm:text-xl text-white">
                  {index + 1}.
                </span>
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-gray-300 shadow-md">
                  <Image
                    src={user.profile_image || "/icons/pp.png"}
                    alt={user.full_name}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-base sm:text-lg text-white">
                    {user.full_name}
                  </span>
                  <span className="text-xs sm:text-sm text-white">
                    @{user.username}
                  </span>
                </div>
                <span className="ml-auto text-base sm:text-lg font-semibold bg-gradient-to-br from-gray-800 to-gray-800 text-white px-2 sm:px-3 py-1 rounded-full shadow-md">
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
