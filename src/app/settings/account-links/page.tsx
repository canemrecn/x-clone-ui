"use client";

import useSWR, { mutate } from "swr";
import { useState, FormEvent, useCallback, useMemo } from "react";

interface SocialAccount {
  id: number;
  platform: string;
  accountLink: string;
  created_at: string;
}

// SWR fetcher: Token'ı localStorage'dan okuyoruz
const fetcher = (url: string) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error("Error fetching social accounts");
    return res.json();
  });
};

export default function AccountLinksPage() {
  // SWR ile sosyal hesapları çekiyoruz.
  const { data, error } = useSWR<{ socialAccounts: SocialAccount[] }>(
    "/api/social-accounts",
    fetcher,
    { revalidateOnFocus: false }
  );

  const [platform, setPlatform] = useState("");
  const [accountLink, setAccountLink] = useState("");
  const [message, setMessage] = useState("");

  const loading = !data && !error;

  const handleAddAccount = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
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
        // SWR cache'ini yeniden doğrula
        mutate("/api/social-accounts");
        setPlatform("");
        setAccountLink("");
      } catch (err: any) {
        console.error("Sosyal hesap ekleme hatası:", err);
        setMessage(err.message || "Sosyal hesap eklenirken hata oluştu.");
      }
    },
    [platform, accountLink]
  );

  const handleDeleteAccount = useCallback(async (accountId: number) => {
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
      mutate("/api/social-accounts");
    } catch (err: any) {
      console.error("Sosyal hesap silme hatası:", err);
      setMessage(err.message || "Sosyal hesap silinirken hata oluştu.");
    }
  }, []);

  const renderedAccounts = useMemo(() => {
    if (!data?.socialAccounts || data.socialAccounts.length === 0) {
      return (
        <p className="text-center text-lg text-white">
          Henüz sosyal medya hesabı eklenmemiş.
        </p>
      );
    }
    return (
      <ul className="space-y-4">
        {data.socialAccounts.map((account) => (
          <li
            key={account.id}
            className="p-4 bg-gradient-to-br from-gray-800 to-gray-800 rounded shadow-md flex justify-between items-center border border-gray-300 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition-all"
          >
            <div>
              <p className="font-semibold text-white">
                Platform: {account.platform}
              </p>
              <p className="text-white">Hesap Linki: {account.accountLink}</p>
              <p className="text-xs text-white">
                Eklenme Tarihi: {new Date(account.created_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleDeleteAccount(account.id)}
              className="bg-gradient-to-br from-gray-800 to-gray-800 text-white px-3 py-1 rounded shadow-md hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition-all"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
    );
  }, [data, handleDeleteAccount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6">
      <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md mb-8">
        Hesap Bağlantıları
      </h1>
      <form
        onSubmit={handleAddAccount}
        className="mb-6 space-y-6 max-w-full sm:max-w-2xl mx-auto"
      >
        <div>
          <label className="block text-sm font-medium text-white">
            Platform
          </label>
          <input
            type="text"
            placeholder="Örn: Twitter, Facebook, Instagram"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">
            Hesap Linki / Kullanıcı Adı
          </label>
          <input
            type="text"
            placeholder="Örn: https://twitter.com/kullaniciadi"
            value={accountLink}
            onChange={(e) => setAccountLink(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-br from-gray-800 to-gray-700 text-white px-4 py-2 rounded hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition-all"
        >
          Hesabı Ekle
        </button>
      </form>
      {loading ? (
        <p className="text-center">Yükleniyor...</p>
      ) : (
        renderedAccounts
      )}
      {message && <p className="text-center mt-4">{message}</p>}
    </div>
  );
}
