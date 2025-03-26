"use client";

import { useRouter } from "next/navigation";

export default function WhatToWatchCard() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/what-to-watch");
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-blue-100 rounded-xl shadow-md p-4 flex items-center justify-center mb-4 hover:bg-blue-200 transition"
    >
      <h2 className="text-xl font-bold text-gray-800">Bugün Ne İzlesem?</h2>
    </div>
  );
}
