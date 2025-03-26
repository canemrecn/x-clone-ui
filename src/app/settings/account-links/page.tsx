"use client";

import { useState, useEffect, FormEvent } from "react";

interface SocialAccount {
  id: number;
  platform: string;
  accountLink: string;
  created_at: string;
}

export default function AccountLinksPage() {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [platform, setPlatform] = useState("");
  const [accountLink, setAccountLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    async function fetchSocialAccounts() {
      try {
        const res = await fetch("/api/social-accounts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Sosyal hesaplar alınamadı.");
        }
        const data = await res.json();
        setSocialAccounts(data.socialAccounts);
      } catch (err: any) {
        setError(err.message || "Sosyal hesaplar alınırken hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    fetchSocialAccounts();
  }, []);

  async function handleAddAccount(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/social-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ platform, accountLink }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Sosyal hesap eklenirken hata oluştu.");
      }
      setMessage(data.message);
      // Listeyi yeniden çekmek için
      const updatedRes = await fetch("/api/social-accounts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedData = await updatedRes.json();
      setSocialAccounts(updatedData.socialAccounts);
      setPlatform("");
      setAccountLink("");
    } catch (err: any) {
      setError(err.message || "Sosyal hesap eklenirken hata oluştu.");
    }
  }

  async function handleDeleteAccount(accountId: number) {
    setError("");
    setMessage("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/social-accounts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: accountId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Sosyal hesap silinirken hata oluştu.");
      }
      setMessage(data.message);
      // Güncellenmiş listeyi çekiyoruz.
      const updatedRes = await fetch("/api/social-accounts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedData = await updatedRes.json();
      setSocialAccounts(updatedData.socialAccounts);
    } catch (err: any) {
      setError(err.message || "Sosyal hesap silinirken hata oluştu.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">

        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
          Hesap Bağlantıları
        </h1>
        <form onSubmit={handleAddAccount} className="mb-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Platform
            </label>
            <input
              type="text"
              placeholder="Örn: Twitter, Facebook, Instagram"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hesap Linki / Kullanıcı Adı
            </label>
            <input
              type="text"
              placeholder="Örn: https://twitter.com/kullaniciadi"
              value={accountLink}
              onChange={(e) => setAccountLink(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Hesabı Ekle
          </button>
        </form>
        {loading ? (
          <p className="text-center">Yükleniyor...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : socialAccounts.length === 0 ? (
          <p className="text-center">Henüz sosyal medya hesabı eklenmemiş.</p>
        ) : (
          <ul className="space-y-4">
            {socialAccounts.map((account) => (
              <li
                key={account.id}
                className="p-4 bg-gray-100 rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    Platform: {account.platform}
                  </p>
                  <p className="text-gray-700">
                    Hesap Linki: {account.accountLink}
                  </p>
                  <p className="text-xs text-gray-500">
                    Eklenme Tarihi: {new Date(account.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )}
        {message && (
          <p className="text-center text-green-500 mt-4">{message}</p>
        )}

    </div>
  );
}
