//src/components/Square_Conquest_Game.tsx
/*Bu dosya, kullanıcıyı /square-conquest-game sayfasına yönlendiren tıklanabilir bir oyun kutusu 
bileşeni olan Square_Conquest_Game bileşenini tanımlar. React useCallback ve useRouter kullanılarak, 
kutuya tıklanınca yönlendirme işlemi yapılır. Görsel olarak gri tonlarda, kenarlıklı ve hover efektiyle 
vurgulanan bir başlık kutusu sunar.*/
"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";

const Square_Conquest_Game: React.FC = React.memo(() => {
  const router = useRouter();

  const handleClick = useCallback(() => {
    router.push("/square-conquest-game");
  }, [router]);

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer border-2 border-gray-300 bg-gradient-to-br from-gray-800 to-gray-800 rounded-xl shadow-md p-4 flex items-center justify-center mb-4 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-700 transition"
    >
      <h2 className="text-xl font-bold text-white">Square Conquest Game</h2>
    </div>
  );
});

export default Square_Conquest_Game;
