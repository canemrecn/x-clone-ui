// src/app/settings/delete-account/page.tsx
/*Bu dosya, kullanıcıların e-posta, şifre ve silme nedeni bilgilerini girerek hesaplarını kalıcı olarak silmelerini sağlayan
bir "Hesabı Sil" sayfası sunar. Kullanıcı bilgileri /api/auth/delete-account endpoint’ine DELETE isteğiyle gönderilir.
İşlem başarılı olursa kullanıcı /register sayfasına yönlendirilir. Yalnızca HTTP-only cookie kullanımı esas alınmıştır.*/
"use client";

import { useState, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState(""); // Silme nedeni
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      if (!email || !password) {
        setError("Lütfen tüm alanları doldurun.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/delete-account", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // HTTP-only cookie için zorunlu
          body: JSON.stringify({ email, password, reason }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Hesap silinirken hata oluştu.");
        } else {
          setError("");
          router.push("/register");
        }
      } catch (err: any) {
        setError(err.message || "Sunucu hatası oluştu.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, reason, router]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md">
        Hesabı Kalıcı Olarak Sil
      </h1>

      <form onSubmit={handleDelete} className="space-y-6 max-w-md mx-auto">
        <div>
          <label className="block text-sm font-medium text-white">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">
            Hesabınızı neden silmek istiyorsunuz? (Opsiyonel)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Sebebinizi kısaca açıklayın..."
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>

        {error && <p className="text-center text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition"
        >
          {loading ? "İşlem yapılıyor..." : "Hesabı Sil"}
        </button>
      </form>
    </div>
  );
}
