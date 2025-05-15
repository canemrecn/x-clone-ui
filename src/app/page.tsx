//src/app/page.tsx
/*Bu dosya, uygulamanın ana sayfasını (Homepage) tanımlar; kullanıcı giriş yapmamışsa /register sayfasına yönlendirir, giriş yapılmışsa dil 
seçici, arama bileşeni (Search), kare ele geçirme oyunu (Square_Conquest_Game), izlenecek film önerisi kartı (WhatToWatchCard) ve içerik 
akışı (Feed) gibi bileşenleri sırasıyla gösterir ve bu yapıyı mobil ve masaüstü cihazlara duyarlı bir şekilde düzenler.*/
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Feed from "@/components/Feed";

export default function Homepage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth?.user) {
      router.push("/login");
    }
  }, [auth?.user, router]);

  if (!auth?.user) {
    return <div className="text-center text-lg font-bold">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white pt-20 pb-20">
      <h1>PROJE GELİŞTİRME AŞAMASINDADIR. HENÜZ PLATFORM KULLANIMA AÇILMAMIŞTIR VE TÜM TELİF HAKLARI SAKLIDIR</h1>
      <Feed />
    </div>
  );
}
