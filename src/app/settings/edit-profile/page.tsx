//src/app/settings/edit-profile/page.tsx
/*Bu dosya, kullanıcının profil bilgilerini (isim ve kullanıcı adı) düzenlemesine olanak tanıyan bir "Profili Düzenle" sayfası sunar; 
kullanıcı formu doldurup gönderdiğinde, bilgiler Bearer token ile birlikte /api/users/edit-profile API endpoint’ine POST isteğiyle 
gönderilir, işlem başarılı olursa kullanıcı profil sayfasına yönlendirilir, hata oluşursa ekranda gösterilir.*/
"use client";

import { useState, FormEvent, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // Import js-cookie to get the token from HttpOnly cookies

export default function EditProfile() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get token from HttpOnly cookie using js-cookie
  const token = Cookies.get("token");

  const [storedUser, setStoredUser] = useState<{ full_name: string, username: string }>({ full_name: "", username: "" });

  // UseEffect to fetch user data when the component mounts
  useEffect(() => {
    if (token) {
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
            setStoredUser(data.user);
            setFullName(data.user.full_name);
            setUsername(data.user.username);
          }
        } catch (err) {
          console.error("User fetch error:", err);
        }
      }
      fetchUser();
    }
  }, [token]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const res = await fetch("/api/users/edit-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: fullName,
            username: username,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Güncelleme sırasında hata oluştu.");
        } else {
          router.push("/profile");
        }
      } catch (err: any) {
        setError(err.message || "Bir hata oluştu, lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    },
    [fullName, username, token, router]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md">
        Profili Düzenle
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-white">
            İsim
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
            required
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-white">
            Kullanıcı Adı
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
            required
          />
        </div>
        {error && <p className="text-center text-white">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-br from-gray-800 to-gray-700 text-white px-4 py-2 rounded hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition"
        >
          {loading ? "Güncelleniyor..." : "Güncelle"}
        </button>
      </form>
    </div>
  );
}
