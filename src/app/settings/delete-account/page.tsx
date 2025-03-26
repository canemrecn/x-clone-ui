"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const token = localStorage.getItem("token");
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">

        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Hesabı Sil</h1>
        <form onSubmit={handleDelete} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          {error && <p className="text-center text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            {loading ? "İşlem yapılıyor..." : "Hesabı Sil"}
          </button>
        </form>

    </div>
  );
}
