"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
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
  }, []);

  const handleSubmit = async (e: FormEvent) => {
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
    const token = localStorage.getItem("token");
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
        // Başarılı işlem sonrası yönlendirme yapılabilir.
        // router.push("/profile");
      }
    } catch (err: any) {
      setError(err.message || "Şifre değiştirme sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">

        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Şifre Değiştir</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mevcut Şifre</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Yeni Şifre</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          {securityQuestion && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Güvenlik Sorusu</label>
              <p className="mt-1 p-2 bg-gray-100 rounded-md">{securityQuestion}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Güvenlik Cevabı</label>
            <input
              type="text"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              placeholder="Güvenlik sorusunun cevabını girin."
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          {error && <p className="text-center text-red-500">{error}</p>}
          {message && <p className="text-center text-green-500">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            {loading ? "Güncelleniyor..." : "Şifre Değiştir"}
          </button>
        </form>

    </div>
  );
}
