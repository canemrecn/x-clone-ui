"use client";

/*
Bu dosya, uygulamanın ana sayfasını (Homepage) tanımlar; kullanıcı giriş yapmamışsa /register sayfasına yönlendirir, giriş yapılmışsa dil 
seçici, arama bileşeni (Search), kare ele geçirme oyunu (Square_Conquest_Game), izlenecek film önerisi kartı (WhatToWatchCard) ve içerik 
akışı (Feed) gibi bileşenleri sırasıyla gösterir ve bu yapıyı mobil ve masaüstü cihazlara duyarlı bir şekilde düzenler.
*/

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Feed from "@/components/Feed";
import LeftBar from "@/components/LeftBar";

export default function Homepage() {
  const auth = useAuth();
  const router = useRouter();

  const [enabled3D, setEnabled3D] = useState(false);

  // Kullanıcı kontrolü
  useEffect(() => {
    if (!auth?.user) {
      router.push("/login");
    }
  }, [auth?.user, router]);

  // 3D efekt durumu localStorage'dan al
  useEffect(() => {
    const stored = localStorage.getItem("enable3D");
    if (stored === "true") {
      setEnabled3D(true);
    }
  }, []);

  if (!auth?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-lg font-semibold">
        Yükleniyor...
      </div>
    );
  }

  return (
    <>
      <LeftBar enabled3D={enabled3D} setEnabled3D={setEnabled3D} />

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto mb-6 text-center bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
          <h1 className="depth-3d text-4xl font-bold color-black">Welcome to Undergo</h1>
          <p>Tüm Telif Hakları Saklıdır</p>
          <p>Bu uygulama şu anda demo aşamasındadır ve test amaçlı olarak erişime açıktır. Yayınlanma süreci tamamlanana kadar yalnızca değerlendirme ve geliştirme amaçlı kullanılabilir. Uygulamanın mevcut durumuna ilişkin herhangi bir hukuki, ticari veya kullanıcı bazlı sorumluluk kabul edilmemektedir. Kullanıcı siteye kayıt olarak bu şartı kabul etmiş sayılır</p>
        </div>

        <Feed />
      </div>
    </>
  );
}
