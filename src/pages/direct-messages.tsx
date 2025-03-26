"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import UsersList from "@/app/direct-messages/UsersList";
import ChatWindow from "@/components/ChatWindow";

export default function DirectMessagesPage() {
  // Bazı durumlarda useSearchParams() null dönebiliyor.
  // Bunu ele almak için:
  const searchParams = useSearchParams();
  if (!searchParams) {
    // Eğer gerçekten null dönecek bir senaryo varsa, fallback
    return (
      <div className="text-white">
        Parametreler alınamadı. Lütfen sayfayı yenileyin.
      </div>
    );
  }

  // buddyId parametresini al
  const buddyIdParam = searchParams.get("buddyId");
  // buddyId'yi number'a çevir (yoksa null)
  const buddyId = buddyIdParam ? Number(buddyIdParam) : null;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 text-white">
      <div className="md:min-w-[768px] md:h-[800px] w-full h-full bg-gradient-to-br from-gray-800 to-gray-800 rounded-lg shadow-lg mx-auto">
        {!buddyId ? (
          <UsersList />
        ) : (
          // buddyId varsa ChatWindow'a prop olarak veriyoruz
          <ChatWindow buddyId={buddyId} />
        )}
      </div>
    </div>
  );
}
