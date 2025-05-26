// src/app/settings/delete-account/page.tsx
/*Bu dosya, kullanıcıların e-posta, şifre ve silme nedeni bilgilerini girerek hesaplarını kalıcı olarak silmelerini sağlayan
bir "Hesabı Sil" sayfası sunar. Kullanıcı bilgileri /api/auth/delete-account endpoint’ine DELETE isteğiyle gönderilir.
İşlem başarılı olursa kullanıcı /register sayfasına yönlendirilir. Yalnızca HTTP-only cookie kullanımı esas alınmıştır.*/
// src/app/settings/delete-account/page.tsx
"use client";

import { useState, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
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
          credentials: "include",
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
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2f] via-[#2c2c3e] to-[#25253a] text-white px-6 py-10 pt-24 pb-20">
      <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 mb-10">
        🗑️ Hesabı Kalıcı Olarak Sil
      </h1>

      <form
        onSubmit={handleDelete}
        className="space-y-6 max-w-xl mx-auto bg-[#2f2f45] p-8 rounded-2xl shadow-lg"
      >
        <div>
          <label className="block mb-1 font-semibold text-sm text-gray-300">📧 E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-sm text-gray-300">🔒 Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-sm text-gray-300">
            ❓ Neden silmek istiyorsunuz? <span className="text-gray-400">(Opsiyonel)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Sebebinizi kısaca açıklayın..."
            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        {error && <p className="text-center text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-lg font-bold shadow-lg transition-all duration-200"
        >
          {loading ? "İşlem yapılıyor..." : "Hesabı Kalıcı Olarak Sil"}
        </button>
      </form>
    </div>
  );
}
