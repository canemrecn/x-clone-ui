//src/app/page.tsx
/*Bu dosya, uygulamanın ana sayfasını (Homepage) tanımlar; kullanıcı giriş yapmamışsa /register sayfasına yönlendirir, giriş yapılmışsa dil 
seçici, arama bileşeni (Search), kare ele geçirme oyunu (Square_Conquest_Game), izlenecek film önerisi kartı (WhatToWatchCard) ve içerik 
akışı (Feed) gibi bileşenleri sırasıyla gösterir ve bu yapıyı mobil ve masaüstü cihazlara duyarlı bir şekilde düzenler.*/
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import Feed from "@/components/Feed";
import WhatToWatchCard from "@/components/WhatToWatchCard";

export default function Homepage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth?.user) {
      // Eğer kullanıcı yoksa login sayfasına yönlendir
      router.push("/login");
    }
  }, [auth?.user, router]);

  if (!auth?.user) {
    return <div className="text-center text-lg font-bold">Yükleniyor...</div>;
  }

  <p>Gönderi paylaşmak için önce dil seçmelisiniz</p>
  const languages = [
    { code: "tr", image: "/icons/turkey.png" },
    { code: "en", image: "/icons/united-kingdom.png" },
  ];

  const content = useMemo(
    () => (
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-0 rounded-lg shadow-md">
          <ul className="flex gap-6">
            {languages.map((lang) => (
              <li key={lang.code}>
                <Link href={`/${lang.code}`}>
                  <div className="p-1 rounded transition hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600">
                    <Image src={lang.image} alt={lang.code} width={24} height={24} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        <WhatToWatchCard />
        <Feed />
      </div>
    ),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 relative">
      <div className="pt-4">{content}</div>
    </div>
  );
}
