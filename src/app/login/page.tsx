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
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function Login() {
  const auth = useAuth();
  const [user, setUser] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (auth?.login) {
        await auth.login({ email: user.email, password: user.password });
        router.push("/");
      } else {
        console.error("❌ AuthContext içinde `login` fonksiyonu bulunamadı!");
      }
    },
    [user, auth, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center text-white pt-24 pb-20">
      <div className="w-full max-w-md px-8 py-10 bg-[#2c2c3e] rounded-2xl shadow-2xl relative border border-gray-700">
        <h1>Doğrulama kodunu girerken hata yaşarsanız lütfen emrecancnzytnl@gmail.com adresine mail yollayarak iletişime geçin</h1>
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/icons/logo22.png"
            alt="Undergo Logo"
            width={80}
            height={80}
            className="rounded-full shadow"
          />
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            UNDERGO
          </h1>
        </div>

        <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 bg-[#1f1f30] text-white placeholder-gray-400 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-600 outline-none transition"
            onChange={(e) =>
              setUser((prev) => ({ ...prev, email: e.target.value }))
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-[#1f1f30] text-white placeholder-gray-400 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-600 outline-none transition"
            onChange={(e) =>
              setUser((prev) => ({ ...prev, password: e.target.value }))
            }
            required
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold py-3 rounded-md shadow-lg transition"
          >
            Giriş Yap
          </button>

          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-sm text-purple-300 hover:text-purple-400 hover:underline transition text-center"
          >
            Şifremi Unuttum?
          </button>

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="w-full bg-[#1f1f30] hover:bg-[#282840] text-white font-medium py-3 rounded-md transition border border-gray-600"
          >
            Hesabın yok mu? Kayıt Ol
          </button>
        </form>
      </div>
    </div>
  );
}
