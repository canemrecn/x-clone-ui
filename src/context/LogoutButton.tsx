//src/context/LogoutButton.tsx
/*Bu dosya, kullanıcıyı sistemden çıkış yaptıran bir LogoutButton bileşeni tanımlar; AuthContext üzerinden 
logout fonksiyonunu alarak, butona tıklandığında kullanıcıyı güvenli şekilde oturumdan çıkarır ve bu işlemi 
useAuth() hook'u aracılığıyla sağlar.*/
// src/components/LogoutButton.tsx
"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

const LogoutButton: React.FC = React.memo(() => {
  const auth = useAuth();

  if (!auth) {
    console.error("❌ AuthContext bulunamadı!");
    return null;
  }

  const handleLogout = async () => {
    try {
      await auth.logout(); // Call the logout function from AuthContext
    } catch (error) {
      console.error("Çıkış yaparken hata oluştu:", error);
    }
  };

  return <button onClick={handleLogout}>Çıkış Yap</button>;
});

export default LogoutButton;
