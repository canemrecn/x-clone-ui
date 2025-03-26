"use client";

import { useState, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email || !username || !securityAnswer || !newPassword || !confirmNewPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, securityAnswer, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error resetting password.");
      } else {
        setMessage(data.message);
        // Optionally, redirect after success: router.push("/login");
      }
    } catch (err: any) {
      setError(err.message || "Error resetting password.");
    } finally {
      setLoading(false);
    }
  }, [email, username, securityAnswer, newPassword, confirmNewPassword]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 p-4 text-white flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 p-10 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-700 shadow-2xl w-full max-w-md">
        <h1 className="text-center text-2xl font-bold mb-6">Şifremi Unuttum</h1>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded p-2 bg-gray-900 text-white outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded p-2 bg-gray-900 text-white outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Güvenlik Cevabı</label>
          <input
            type="text"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            placeholder="Kayıt sırasında belirlediğiniz güvenlik sorusunun cevabını girin."
            required
            className="mt-1 block w-full border border-gray-300 rounded p-2 bg-gray-900 text-white outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Yeni Şifre</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded p-2 bg-gray-900 text-white outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Yeni Şifre (Tekrar)</label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded p-2 bg-gray-900 text-white outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>
        {error && <p className="text-center text-red-400">{error}</p>}
        {message && <p className="text-center text-green-400">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-br from-gray-800 to-gray-700 text-white px-4 py-2 rounded hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition-all"
        >
          {loading ? "İşlem yapılıyor..." : "Şifreyi Sıfırla"}
        </button>
      </form>
    </div>
  );
}
