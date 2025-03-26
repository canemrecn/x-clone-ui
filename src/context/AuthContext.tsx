"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";

type User = {
  id: number;
  full_name: string;
  username: string;
  level?: string;
  points?: number;
  profile_image?: string;
  joined_date?: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    // Token varsa API'den kullanıcı bilgisi çekiliyor.
    fetch("/api/auth/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error("❌ Kullanıcı bilgisi alınamadı:", res.status);
          localStorage.removeItem("token");
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch((error) => console.error("❌ API isteği başarısız:", error))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }
    if (data.token) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
    } else {
      console.error("Login successful but no token received");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  if (loading) {
    return <div className="text-center text-lg font-bold">Yükleniyor...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
