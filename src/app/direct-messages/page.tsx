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

  return (
  <div className="w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col md:flex-row overflow-hidden">
    
    {/* Kullanıcı listesi */}
    <div className="w-full md:w-[280px] h-auto md:h-full border-b md:border-b-0 md:border-r border-gray-700 bg-gradient-to-b from-gray-800 to-gray-900 overflow-y-auto">
      <UsersList />
    </div>

    {/* Mesajlaşma penceresi */}
    <div className="flex-1 h-full overflow-hidden">
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
