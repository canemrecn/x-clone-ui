//src/components/RightBar.tsx
/*Bu dosya, yalnızca masaüstü (large screen) kullanıcılarına gösterilen sabit bir sağ panel (RightBar) 
bileşeni tanımlar. Panelde sırasıyla kullanıcı sıralaması (Arrangement), notlar (Notes), bir reklam alanı 
(AdPlaceholder) ve en altta hizmet koşulları, gizlilik ve çerez politikası gibi yasal bağlantılar yer alır. 
Görsel olarak üstten alta düzenlenmiş, sabit konumlu ve duyarlı bir şekilde tasarlanmıştır.*/
"use client";

import React from "react";
import Arrangement from "@/components/Arrangement";
import Notes from "@/components/Notes";
import Search from "./Search";

export default function RightBar() {
  return (
    <div
      className="
        hidden 
        lg:flex 
        flex-col 
        fixed 
        top-0 
        right-0 
        h-screen
        w-80 
        bg-gradient-to-b from-gray-900 to-gray-800 
        rounded-l-xl
        shadow-xl 
        z-50 
        py-6 
        px-4 
        gap-6
      "
    >
      <Search />
      <Arrangement />
      <Notes />
    </div>
  );
}
