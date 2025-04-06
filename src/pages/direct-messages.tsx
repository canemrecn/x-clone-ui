//src/pages/direct-messages.tsx
/*Bu dosya, /direct-messages sayfasını tanımlar ve URL'deki buddyId sorgu parametresine göre içerik gösterir; 
eğer buddyId parametresi yoksa kullanıcı listesi (<UsersList />) görüntülenir, varsa ilgili kullanıcıyla 
birebir mesajlaşma penceresi (<ChatWindow />) açılır. Sayfa, koyu gri degrade arka plan ve beyaz metinle 
şık bir sohbet arayüzü sunar.*/
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import UsersList from "@/app/direct-messages/UsersList";
import ChatWindow from "@/components/ChatWindow";

export default function DirectMessagesPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth?.user) {
      router.push("/login"); // Or "/register"
    }
  }, [auth?.user, router]);

  if (!auth?.user) return null;

  const { query } = router;  // Use useRouter to access query parameters
  const buddyIdParam = query.buddyId;
  const buddyId = buddyIdParam ? Number(buddyIdParam) : null;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 text-white">
      <div className="md:min-w-[768px] md:h-[800px] w-full h-full bg-gradient-to-br from-gray-800 to-gray-800 rounded-lg shadow-lg mx-auto">
        {!buddyId ? <UsersList /> : <ChatWindow buddyId={buddyId} />}
      </div>
    </div>
  );
}
