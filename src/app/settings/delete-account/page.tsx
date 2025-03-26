"use client";

import { useState, FormEvent, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Token'ı cache'leyerek her render'da yeniden okumayı önlüyoruz
  const token = useMemo(() => localStorage.getItem("token"), []);

  const handleDelete = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const res = await fetch("/api/auth/delete-account", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Hesap silinirken hata oluştu.");
        } else {
          router.push("/register");
        }
      } catch (err: any) {
        setError(err.message || "Hesap silinirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, token, router]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md">
        Hesabı Sil
      </h1>
      <form onSubmit={handleDelete} className="space-y-6 max-w-md mx-auto">
        <div>
          <label className="block text-sm font-medium text-white">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">
            Şifre
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>
        {error && <p className="text-center text-white">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-br from-gray-800 to-gray-700 text-white px-4 py-2 rounded hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition"
        >
          {loading ? "İşlem yapılıyor..." : "Hesabı Sil"}
        </button>
      </form>
    </div>
  );
}
