"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";

const WhatToWatchCard: React.FC = React.memo(() => {
  const router = useRouter();

  const handleClick = useCallback(() => {
    router.push("/what-to-watch");
  }, [router]);

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer border-2 border-gray-300 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow-md p-4 flex items-center justify-center mb-4 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-700 transition"
    >
      <h2 className="text-xl font-bold text-white">Bugün Ne İzlesem?</h2>
    </div>
  );
});

export default WhatToWatchCard;
