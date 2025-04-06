//src/context/AuthContext.tsx
/*Bu dosya, kullanıcı kimlik doğrulamasını yöneten ve uygulama genelinde kullanılmasını sağlayan AuthContext 
adlı bir React context sağlayıcısı tanımlar; kullanıcı giriş (login), çıkış (logout) işlemlerini HttpOnly 
cookie tabanlı güvenli yöntemle gerçekleştirir, giriş yapmış kullanıcının bilgilerini /api/auth/user endpoint’i 
üzerinden alarak user state’ine kaydeder ve useAuth() hook'u ile diğer bileşenlerin bu bilgilere erişmesini 
sağlar; ayrıca KVKK ve GDPR uyumluluğu için localStorage kullanılmaz ve açık rıza bilgileriyle login yapılmasına 
imkân verir.*/
"use client";
/* Bu dosya, kullanıcı kimlik doğrulamasını yöneten AuthContext sağlayıcısıdır.
 * HTTP-only cookie tabanlı güvenli kimlik doğrulama uygular.
 * localStorage KULLANILMAZ. 
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

type User = {
  id: number;
  full_name: string;
  username: string;
  role: string;
  level?: string;
  points?: number;
  profile_image?: string;
  joined_date?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (formData: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/user", {
        method: "GET",
        credentials: "include", // HTTP-only cookie için gerekli
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("fetchUser error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (formData: { email: string; password: string }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // HTTP-only cookie alabilmek için
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Giriş başarısız");
      }

      await fetchUser();
      router.push("/");
    } catch (error: any) {
      console.error("login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // cookie silinecek
      });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("logout error:", error);
    }
  };

  const contextValue = useMemo(
    () => ({ user, loading, login, logout, fetchUser }),
    [user, loading, login, logout, fetchUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
