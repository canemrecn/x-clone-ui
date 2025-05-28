"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ChatWindow from "@/components/ChatWindow";
import UsersList from "./UsersList";

export default function DirectMessagesPage() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const buddyIdParam = searchParams?.get("buddyId");
  const buddyId = buddyIdParam ? Number(buddyIdParam) : null;

  useEffect(() => {
    if (!auth?.user) router.push("/login");
  }, [auth?.user, router]);

  if (!auth?.user) return null;

  // Kullanıcı seçildiğinde URL'ye buddyId ekle
  const handleSelectBuddy = (buddyId: number) => {
    router.push(`/direct-messages?buddyId=${buddyId}`);
  };

  // Geri butonuna basıldığında sadece buddyId parametresini kaldır
  const handleBackToList = () => {
    router.push("/direct-messages");
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      {!buddyId ? (
        // Kullanıcı listesi tam ekran
        <UsersList onSelectBuddy={handleSelectBuddy} />
      ) : (
        // ChatWindow tam ekran
        <ChatWindow buddyId={buddyId} onClose={handleBackToList} />
      )}
    </div>
  );
}
