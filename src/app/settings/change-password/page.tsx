//src/app/settings/change-password/page.tsx
/*Bu dosya, kullanıcıların mevcut şifrelerini ve güvenlik sorusunun cevabını girerek yeni bir şifre belirlemelerini sağlayan bir 
"Şifre Değiştir" sayfası sunar; JWT ile kimlik doğrulaması yapıldıktan sonra /api/auth/change-password endpoint’ine gerekli bilgiler 
gönderilir, işlem başarılı olursa kullanıcıya bilgilendirme mesajı gösterilir.*/
"use client";

import { useState, FormEvent, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // Import js-cookie to get the token from HttpOnly cookies

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

  // Get token from cookies
  const token = Cookies.get("token");

  // Fetch the user's security question using the token
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
        setError("All fields are required.");
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
          // Success message and possible redirect after success
          // router.push("/profile");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md">
        Şifre Değiştir
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-full sm:max-w-2xl mx-auto"
      >
        <div>
          <label className="block text-sm font-medium text-white">
            Mevcut Şifre
          </label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">
            Yeni Şifre
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">
            Yeni Şifre (Tekrar)
          </label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
            required
          />
        </div>
        {securityQuestion && (
          <div>
            <label className="block text-sm font-medium text-white">
              Güvenlik Sorusu
            </label>
            <p className="mt-1 p-2 bg-gradient-to-br from-gray-800 to-gray-800 rounded-md">
              {securityQuestion}
            </p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-white">
            Güvenlik Cevabı
          </label>
          <input
            type="text"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            placeholder="Güvenlik sorusunun cevabını girin."
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
            required
          />
        </div>
        {error && <p className="text-center text-white">{error}</p>}
        {message && <p className="text-center text-white">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-br from-gray-800 to-gray-700 text-white px-4 py-2 rounded hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition"
        >
          {loading ? "Güncelleniyor..." : "Şifre Değiştir"}
        </button>
      </form>
    </div>
  );
}
