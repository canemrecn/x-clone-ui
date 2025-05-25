"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ChatWindow from "@/components/ChatWindow";
import UsersList from "./UsersList";
import Image from "next/image";

export default function DirectMessagesPage() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const buddyIdParam = searchParams.get("buddyId");
  const buddyId = buddyIdParam ? Number(buddyIdParam) : null;

  useEffect(() => {
    if (!auth?.user) router.push("/login");
  }, [auth?.user, router]);

  if (!auth?.user) return null;

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col md:flex-row relative">
      
      {/* Geri Butonu */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-50 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
      >
        <Image src="/icons/left.png" alt="Geri" width={24} height={24} />
      </button>

      {/* Kullanıcı listesi */}
      <div className="w-full md:w-[280px] h-full border-r border-gray-700 overflow-y-auto shadow-inner bg-gradient-to-b from-gray-800 to-gray-900">
        <UsersList />
      </div>

      {/* Mesajlaşma penceresi */}
      <div className="flex-1 h-full">
        {buddyId ? (
          <ChatWindow buddyId={buddyId} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-lg italic">
            Mesajlaşmak için bir kullanıcı seçin
          </div>
        )}
      </div>
    </div>
  );
}
