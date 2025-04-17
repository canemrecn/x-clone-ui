//src/pages/register.tsx
/*Bu dosya, kullanıcıların yeni bir hesap oluşturmasını sağlayan kayıt (register) sayfasını tanımlar. Kullanıcıdan 
ad-soyad, kullanıcı adı, e-posta, şifre, güvenlik sorusu ve cevabı gibi bilgileri alır ve /api/auth/register 
endpoint’ine POST isteğiyle gönderir. Kayıt başarılı olursa, e-posta doğrulama sayfasına yönlendirir 
(/auth/verify?email=...). Sayfa, mobil ve masaüstü için duyarlı tasarlanmış şık bir arayüze sahiptir ve 
kullanıcının giriş sayfasına geçiş yapabilmesini sağlayan buton da içerir.*/
"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Register() {
  const [user, setUser] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  const router = useRouter();

  const handleRegister = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          // Doğrulama sayfasına yönlendirirken e-posta query parametresi olarak gönderiliyor
          router.push(`/auth/verify?email=${encodeURIComponent(user.email)}`);
        } else {
          alert(data.message);
        }
      } catch (error: any) {
        alert(error.message || "Registration failed.");
      }
    },
    [user, router]
  );

  return (
    <div className="flex min-h-screen overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 relative text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-800/80 blur-[120px] rounded-3xl"></div>

      {/* Sol Taraf: yalnızca md ve üzeri ekranlarda göster */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative z-10">
        <Image
          src="/icons/logom2.png"
          alt="Left column background"
          width={900}
          height={900}
          className="object-contain drop-shadow-xl"
        />
      </div>

      {/* Sağ Taraf: mobilde tam genişlik, md ve üzeri ekranlarda yarı genişlik */}
      <div className="w-full md:w-1/2 flex items-center justify-center relative z-10">
        <div className="relative p-10 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-300 shadow-lg before:absolute before:inset-0 before:bg-gradient-to-br before:from-gray-800 before:to-gray-800/20 before:blur-xl before:rounded-2xl">
          <div className="p-6 md:p-10 relative z-10">
            <form onSubmit={handleRegister} className="flex flex-col gap-6">
              <h1 className="text-center text-2xl font-bold">Register</h1>
              <div className="flex justify-center">
                <h1 className="text-lg font-semibold">UNDERGO</h1>
              </div>
              <input
                type="text"
                placeholder="Full Name"
                className="p-3 rounded-lg bg-gradient-to-br from-gray-800 to-gray-800/50 placeholder-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm"
                onChange={(e) => setUser((prev) => ({ ...prev, full_name: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Username"
                className="p-3 rounded-lg bg-gradient-to-br from-gray-800 to-gray-800/50 placeholder-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm"
                onChange={(e) => setUser((prev) => ({ ...prev, username: e.target.value }))}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="p-3 rounded-lg bg-gradient-to-br from-gray-800 to-gray-800/50 placeholder-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm"
                onChange={(e) => setUser((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="p-3 rounded-lg bg-gradient-to-br from-gray-800 to-gray-800/50 placeholder-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm"
                onChange={(e) => setUser((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Security Question"
                className="p-3 rounded-lg bg-gradient-to-br from-gray-800 to-gray-800/50 placeholder-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm"
                onChange={(e) => setUser((prev) => ({ ...prev, securityQuestion: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Security Answer"
                className="p-3 rounded-lg bg-gradient-to-br from-gray-800 to-gray-800/50 placeholder-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm"
                onChange={(e) => setUser((prev) => ({ ...prev, securityAnswer: e.target.value }))}
                required
              />
              <button
                type="submit"
                className="py-3 px-4 font-semibold rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 text-white hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-md transition-all"
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="py-3 px-4 font-semibold rounded-lg bg-gradient-to-br from-gray-800 to-gray-800 text-white hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-md transition-all"
              >
                Already have an account?
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
