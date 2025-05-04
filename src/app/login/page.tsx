//src/pages/login.tsx
/*Bu dosya, kullanıcıların e-posta ve şifre bilgileriyle güvenli bir şekilde giriş yapmasını sağlayan React 
tabanlı bir Login sayfasıdır. Kullanıcı bilgileri bir form aracılığıyla toplanır ve AuthContext içindeki 
login fonksiyonu çağrılarak oturum başlatılır. Giriş işlemi başarılı olduğunda anasayfaya (/) yönlendirme 
yapılır. Aynı zamanda kullanıcıya "Şifremi unuttum?" ve "Kayıt ol" seçenekleri sunulur. Giriş işlemi 
sırasında KVKK ve GDPR uyumu için gerekli açık rıza bayrakları (consent) da otomatik olarak gönderilir. 
Arayüz, mobil ve masaüstü için duyarlıdır ve sade, karanlık tema ile tasarlanmıştır.*/
"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // useAuth burada doğru şekilde kullanılmalı
import Image from "next/image";

export default function Login() {
  const auth = useAuth();  // useAuth ile AuthContext'e erişim
  const [user, setUser] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      console.log("Gelen Login Bilgileri:", user);

      if (auth?.login) {
        await auth.login({ email: user.email, password: user.password });
        router.push("/"); // Giriş başarılıysa anasayfaya yönlendir
      } else {
        console.error("❌ AuthContext içinde `login` fonksiyonu bulunamadı!");
      }
    },
    [user, auth, router]
  );

  return (
    <div className="flex min-h-screen overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 relative text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-800/80 blur-[120px] rounded-3xl"></div>

      {/* Sol Taraf: yalnızca md ve üzeri ekranlarda göster */}
      <div className="w-1/2 hidden md:flex items-center justify-center relative z-10">
        <Image
          src="/icons/logom2.png"
          alt="Left column background"
          width={300}
          height={300}
          className="object-contain drop-shadow-xl"
        />
      </div>

      {/* Sağ Taraf: mobilde tam genişlik, md ve üzeri ekranlarda yarı genişlik */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative z-10">


        {/* Form Konteyneri */}
        <div className="relative p-10 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-300 shadow-lg before:absolute before:inset-0 before:bg-gradient-to-br before:from-gray-800 before:to-gray-800/30 before:blur-3xl before:rounded-2xl">
          <div className="p-6 md:p-10 relative z-10">
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <h1 className="text-center text-2xl font-bold">Login</h1>

              {/* GIF veya Başlık */}
              <div className="flex justify-center">
                <h1 className="text-lg font-semibold">UNDERGO</h1>
              </div>

              {/* Email Input */}
              <input
                type="email"
                placeholder="Email"
                className="p-3 rounded-lg bg-gradient-to-br from-gray-800 to-gray-800/50 placeholder-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-md"
                onChange={(e) =>
                  setUser((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />

              {/* Password Input */}
              <input
                type="password"
                placeholder="Password"
                className="p-3 rounded-lg bg-gradient-to-br from-gray-800 to-gray-800/50 placeholder-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-md"
                onChange={(e) =>
                  setUser((prev) => ({ ...prev, password: e.target.value }))
                }
                required
              />

              {/* Login Button */}
              <button
                type="submit"
                className="py-3 px-4 font-semibold rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 text-white hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-lg transition-all"
              >
                Login
              </button>

              {/* Şifremi Unuttum Linki */}
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm text-white hover:underline"
              >
                Şifremi Unuttum?
              </button>

              {/* Go to Register */}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="py-3 px-4 font-semibold rounded-lg bg-gradient-to-br from-gray-800 to-gray-800 text-white hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-lg transition-all"
              >
                Don't have an account?
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
