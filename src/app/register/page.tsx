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

      const isOver13 = confirm("Platformumuzu kullanmak için en az 13 yaşında olmanız gerekmektedir. 13 yaşından büyük müsünüz?");
      if (!isOver13) {
        setError("13 yaşından küçük kullanıcıların kayıt olması yasaktır.");
        return;
      }

      if (!user.privacyAccepted) {
        setError("Kayıt olmak için gerekli tüm sözleşmeleri kabul etmelisiniz.");
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
    <div className="flex min-h-screen text-white pt-24 pb-20">
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <Image
          src="/icons/logo22.png"
          alt="Left"
          width={320}
          height={320}
          className="object-contain drop-shadow-2xl animate-pulse"
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
      
        <div className="w-full max-w-xl p-8 bg-[#2b2b3b] rounded-2xl border border-gray-700 shadow-2xl">
          <p>Doğrulama kodunu girerken hata yaşarsanız lütfen emrecancnzytnl@gmail.com adresine mail yollayarak iletişime geçin</p>
          <h2 className="text-center text-3xl font-extrabold text-white mb-2">Kayıt Ol</h2>
          <p className="text-center mb-6 text-gray-400">Dil öğrenenler için sosyal medya platformu</p>

          <form onSubmit={handleRegister} className="space-y-5">
            {[
              { placeholder: "Ad Soyad", key: "full_name", type: "text" },
              { placeholder: "Kullanıcı Adı", key: "username", type: "text" },
              { placeholder: "Email", key: "email", type: "email" },
              { placeholder: "Şifre", key: "password", type: "password" },
              { placeholder: "Güvenlik Sorusu", key: "securityQuestion", type: "text" },
              { placeholder: "Güvenlik Sorusu Cevabı", key: "securityAnswer", type: "text" },
            ].map(({ placeholder, key, type }) => (
              <input
                key={key}
                type={type}
                placeholder={placeholder}
                required
                className="w-full px-4 py-3 rounded-md bg-[#1f1f30] text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-purple-600 outline-none"
                onChange={(e) => setUser((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            ))}

            <div className="space-y-2 text-sm text-gray-300">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1"
                  onChange={(e) => setUser((prev) => ({ ...prev, privacyAccepted: e.target.checked }))}
                />
                <span>
                  <Link href="/privacy-policy" className="underline text-blue-400 hover:text-blue-300" target="_blank">Gizlilik Politikası</Link>,{" "}
                  <Link href="/terms-of-service" className="underline text-blue-400 hover:text-blue-300" target="_blank">Kullanım Koşulları</Link>,{" "}
                  <Link href="/kvkk-aydinlatma-metni" className="underline text-blue-400 hover:text-blue-300" target="_blank">KVKK Aydınlatma Metni</Link>,{" "}
                  <Link href="/acik-riza-metni" className="underline text-blue-400 hover:text-blue-300" target="_blank">Açık Rıza Metni</Link>,{" "}
                  <Link href="/data-processing" className="underline text-blue-400 hover:text-blue-300" target="_blank">DPA Özeti</Link> ve{" "}
                  <Link href="/veri-imha-politikasi" className="underline text-blue-400 hover:text-blue-300" target="_blank">Veri İmha Politikası</Link>'nı okudum ve kabul ediyorum.
                </span>
              </label>

              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1"
                  onChange={(e) => setUser((prev) => ({ ...prev, promoConsent: e.target.checked }))}
                />
                <span>13 yaşından büyüğüm.</span>
              </label>

              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1"
                  onChange={(e) => setUser((prev) => ({ ...prev, analyticsConsent: e.target.checked }))}
                />
                <span>Çerez ve analiz verilerimin işlenmesini ve verilerimin yurt dışına aktarılmasını kabul ediyorum.</span>
              </label>
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-md font-semibold text-white transition"
            >
              Kayıt Ol
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full py-3 bg-[#1f1f30] hover:bg-[#2c2c3c] border border-gray-600 rounded-md font-medium text-white transition"
            >
              Zaten bir hesabınız var mı?
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
