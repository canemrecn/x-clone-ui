// src/app/direct-messages/page.tsx
"use client";

/*Bu dosya, /direct-messages sayfasını tanımlar ve URL'deki buddyId sorgu parametresine göre içerik gösterir; 
eğer buddyId parametresi yoksa kullanıcı listesi (<UsersList />) görüntülenir, varsa ilgili kullanıcıyla 
birebir mesajlaşma penceresi (<ChatWindow />) açılır. Sayfa, koyu gri degrade arka plan ve beyaz metinle 
tam ekran şık bir sohbet arayüzü sunar.*/

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
    router.push("/"); // Anasayfaya yönlendir
  };
  

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white flex flex-col md:flex-row relative">
      
      {/* Geri Butonu */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-50 p-2 bg-black/50 rounded-full hover:bg-black/70"
      >
        <Image src="/icons/left.png" alt="Geri" width={24} height={24} />
      </button>

      {/* Kullanıcı listesi */}
      <div className="w-full md:w-[260px] h-full border-r border-gray-600 overflow-y-auto">
        <UsersList />
      </div>

      {/* Mesajlaşma penceresi */}
      <div className="flex-1 h-full">
        {buddyId ? (
          <ChatWindow buddyId={buddyId} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-300 text-lg italic">
            Mesajlaşmak için bir kullanıcı seçin
          </div>
        )}
      </div>
    </div>
  );
}
