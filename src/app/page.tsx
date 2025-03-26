"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Feed from "@/components/Feed";
import WhatToWatchCard from "@/components/WhatToWatchCard";

export default function Homepage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth?.user) {
      router.push("/register");
    }
  }, [auth?.user, router]);

  if (!auth?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#cae1ff] text-black p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl border border-[#bcd2ee] p-4 mt-4">
        {/* "Bugün Ne İzlesem?" kartı Feed üzerinde ayrı olarak gösterilir */}
        <WhatToWatchCard />
        <Feed />
      </div>
    </div>
  );
}
