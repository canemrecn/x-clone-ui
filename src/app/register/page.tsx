//src/app/register/page.tsx
/*Bu dosya, kullanıcıların yeni bir hesap oluşturmasını sağlayan kayıt (register) sayfasını tanımlar. Kullanıcıdan 
ad-soyad, kullanıcı adı, e-posta, şifre, güvenlik sorusu ve cevabı gibi bilgileri alır ve /api/auth/register 
endpoint’ine POST isteğiyle gönderir. Kayıt başarılı olursa, e-posta doğrulama sayfasına yönlendirir 
(/auth/verify?email=...). Sayfa, mobil ve masaüstü için duyarlı tasarlanmış şık bir arayüze sahiptir ve 
kullanıcının giriş sayfasına geçiş yapabilmesini sağlayan buton da içerir.*/
"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Register() {
  const [user, setUser] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    securityQuestion: "",
    securityAnswer: "",
    privacyAccepted: false,
    promoConsent: false,
    analyticsConsent: false,
    transferConsent: false,
  });

  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!user.privacyAccepted) {
        setError("Kayıt olmak için Gizlilik Politikası’nı kabul etmelisiniz.");
        return;
      }

      setError("");

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });

        const data = await res.json();

        if (res.ok) {
          alert(data.message);
          // ✅ Kayıt başarılıysa verify sayfasına yönlendiriyoruz
          router.push(`/auth/verify`);
        } else {
          alert(data.message);
        }
      } catch (error: any) {
        alert(error.message || "Kayıt işlemi başarısız oldu.");
      }
    },
    [user, router]
  );

  return (
    <div className="flex min-h-screen overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 relative text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-800/80 blur-[120px] rounded-3xl"></div>

      <div className="hidden md:flex w-1/2 items-center justify-center relative z-10">
        <Image
          src="/icons/logom2.png"
          alt="Left column background"
          width={900}
          height={900}
          className="object-contain drop-shadow-xl"
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center relative z-10">
        <div className="relative p-10 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-300 shadow-lg before:absolute before:inset-0 before:bg-gradient-to-br before:from-gray-800 before:to-gray-800/20 before:blur-xl before:rounded-2xl">
          <div className="p-6 md:p-10 relative z-10">
            <form onSubmit={handleRegister} className="flex flex-col gap-6">
              <h1 className="text-center text-2xl font-bold">Register</h1>
              <div className="flex justify-center">
                <h1 className="text-lg font-semibold">UNDERGO</h1>
              </div>

              {/* Form inputları */}
              <input
                type="text"
                placeholder="Full Name"
                required
                className="p-3 rounded-lg bg-gray-800/50 placeholder-white border border-gray-300 focus:ring-2"
                onChange={(e) => setUser((prev) => ({ ...prev, full_name: e.target.value }))}
              />

              <input
                type="text"
                placeholder="Username"
                required
                className="p-3 rounded-lg bg-gray-800/50 placeholder-white border border-gray-300 focus:ring-2"
                onChange={(e) => setUser((prev) => ({ ...prev, username: e.target.value }))}
              />

              <input
                type="email"
                placeholder="Email"
                required
                className="p-3 rounded-lg bg-gray-800/50 placeholder-white border border-gray-300 focus:ring-2"
                onChange={(e) => setUser((prev) => ({ ...prev, email: e.target.value }))}
              />

              <input
                type="password"
                placeholder="Password"
                required
                className="p-3 rounded-lg bg-gray-800/50 placeholder-white border border-gray-300 focus:ring-2"
                onChange={(e) => setUser((prev) => ({ ...prev, password: e.target.value }))}
              />

              <input
                type="text"
                placeholder="Güvenlik Sorusu"
                required
                className="p-3 rounded-lg bg-gray-800/50 placeholder-white border border-gray-300 focus:ring-2"
                onChange={(e) => setUser((prev) => ({ ...prev, securityQuestion: e.target.value }))}
              />

              <input
                type="text"
                placeholder="Güvenlik Sorusu Cevabı"
                required
                className="p-3 rounded-lg bg-gray-800/50 placeholder-white border border-gray-300 focus:ring-2"
                onChange={(e) => setUser((prev) => ({ ...prev, securityAnswer: e.target.value }))}
              />

              {/* Gizlilik Politikası */}
              <label className="flex items-start gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  required
                  onChange={(e) => setUser((prev) => ({ ...prev, privacyAccepted: e.target.checked }))}
                  className="mt-1"
                />
                <span>
                  <Link href="/privacy-policy" target="_blank" className="underline text-blue-400 hover:text-blue-300">
                    Gizlilik Politikası
                  </Link>{" "}
                  ve Aydınlatma Metni’ni okudum, kabul ediyorum.
                </span>
              </label>

              {/* Kullanım Koşulları */}
              <label className="flex items-start gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  required
                  onChange={(e) => setUser((prev) => ({ ...prev, privacyAccepted: e.target.checked }))}
                  className="mt-1"
                />
                <span>
                  <Link href="/terms-of-use" target="_blank" className="underline text-blue-400 hover:text-blue-300">
                    Kullanım Koşulları
                  </Link>
                </span>
              </label>

              {/* Açık rıza kutuları */}
              <div className="flex flex-col gap-2 text-sm text-gray-300">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) => setUser((prev) => ({ ...prev, promoConsent: e.target.checked }))}
                    className="mt-1"
                  />
                  <span>Bana tanıtım ve bilgilendirme mesajları gönderilmesini kabul ediyorum.</span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) => setUser((prev) => ({ ...prev, analyticsConsent: e.target.checked }))}
                    className="mt-1"
                  />
                  <span>Çerez ve analiz verilerimin işlenmesini kabul ediyorum.</span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) => setUser((prev) => ({ ...prev, transferConsent: e.target.checked }))}
                    className="mt-1"
                  />
                  <span>Verilerimin yurt dışına aktarılmasını kabul ediyorum.</span>
                </label>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                className="py-3 px-4 font-semibold rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 text-white hover:from-gray-700 hover:to-gray-600 focus:ring-2 shadow-md transition-all"
              >
                Register
              </button>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="py-3 px-4 font-semibold rounded-lg bg-gradient-to-br from-gray-800 to-gray-800 text-white hover:from-gray-700 hover:to-gray-700 focus:ring-2 shadow-md transition-all"
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
