"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

const LogoutButton: React.FC = React.memo(() => {
  const auth = useAuth();

  if (!auth) {
    console.error("❌ AuthContext bulunamadı!");
    return null;
  }

  return <button onClick={auth.logout}>Çıkış Yap</button>;
});

export default LogoutButton;
