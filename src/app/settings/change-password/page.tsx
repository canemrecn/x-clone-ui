//src/app/settings/change-password/page.tsx
/*Bu dosya, kullanıcıların mevcut şifrelerini ve güvenlik sorusunun cevabını girerek yeni bir şifre belirlemelerini sağlayan bir 
"Şifre Değiştir" sayfası sunar; JWT ile kimlik doğrulaması yapıldıktan sonra /api/auth/change-password endpoint’ine gerekli bilgiler 
gönderilir, işlem başarılı olursa kullanıcıya bilgilendirme mesajı gösterilir.*/
// src/app/settings/change-password/page.tsx
"use client";

import { useState, FormEvent, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const token = Cookies.get("token");

  useEffect(() => {
    if (!token) return;
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/user", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setSecurityQuestion(data.user.security_question || "");
        }
      } catch (err) {
        console.error("User fetch error:", err);
      }
    }
    fetchUser();
  }, [token]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setMessage("");
      setError("");

      if (!oldPassword || !newPassword || !confirmNewPassword || !securityAnswer) {
        setError("Tüm alanlar zorunludur.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError("Yeni şifreler uyuşmuyor.");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ oldPassword, newPassword, securityAnswer }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Şifre değiştirme hatası");
        } else {
          setMessage(data.message);
        }
      } catch (err: any) {
        setError(err.message || "Şifre değiştirme sırasında hata oluştu.");
      } finally {
        setLoading(false);
      }
    },
    [oldPassword, newPassword, confirmNewPassword, securityAnswer, token]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f2b] to-[#2b2b3d] text-white flex items-center justify-center px-4 pt-24 pb-20 py-10">
      <div className="w-full max-w-2xl bg-[#2b2b3d] rounded-2xl shadow-lg p-8 border border-gray-700">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 mb-8">
          🔒 Şifre Değiştir
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium block mb-1">Mevcut Şifre</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Yeni Şifre</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
            />
          </div>

          {securityQuestion && (
            <div>
              <label className="text-sm font-medium block mb-1">Güvenlik Sorusu</label>
              <p className="text-sm bg-gray-800 border border-gray-600 rounded-lg px-4 py-2">{securityQuestion}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium block mb-1">Güvenlik Cevabı</label>
            <input
              type="text"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
              placeholder="Güvenlik cevabını girin"
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          {message && <p className="text-sm text-green-500 text-center">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-orange-600 hover:to-purple-600 transition-all duration-200 font-semibold py-2 rounded-lg shadow-lg"
          >
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
}
