// src/app/[username]/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import Image1 from "@/components/image";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import Post from "@/components/Post";
import LanguageHome from "@/components/LanguageHome"; // DİL SAYFASI BİLEŞENİ

export default function UserPage() {
  const auth = useAuth();
  const { username } = useParams() as { username: string };

  // Dil kodları kontrolü
  const languageCodes = ["en", "de", "it", "es", "ru"];
  if (languageCodes.includes(username)) {
    return <LanguageHome lang={username} />;
  }

  // Profil sayfası kodları:
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // 1) DİL SEÇİMİ STATE
  const [targetLanguage, setTargetLanguage] = useState("tr"); // Örneğin varsayılan Türkçe

  // 2) useEffect içinde localStorage'dan oku
  useEffect(() => {
    const savedLang = localStorage.getItem("targetLanguage");
    if (savedLang) {
      setTargetLanguage(savedLang);
    }
  }, []);

  // 3) Dil seçildiğinde hem state'i hem localStorage'ı güncelle
  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setTargetLanguage(newLang);
    localStorage.setItem("targetLanguage", newLang);
  };

  // 4) Profil kullanıcı bilgisi, gönderi vb. fetch'ler
  async function fetchUser(username: string) {
    const res = await fetch(`/api/users/get-by-username?username=${username}`);
    if (!res.ok) throw new Error("User not found");
    const data = await res.json();
    return data.user;
  }

  async function refetchProfile() {
    if (!username) return;
    try {
      const updatedUser = await fetchUser(username);
      setProfileUser(updatedUser);
    } catch (error) {
      console.error("refetchProfile error:", error);
    }
  }

  useEffect(() => {
    if (!username) return;

    if (username === "profile") {
      if (auth?.user) {
        setProfileUser(auth.user);
      }
      return;
    }

    fetchUser(username)
      .then((userData) => {
        setProfileUser(userData);
      })
      .catch((err) => console.error(err));
  }, [auth, username]);

  useEffect(() => {
    if (!profileUser || !profileUser.id) return;
    setPostsLoading(true);
    fetch(`/api/posts?user_id=${profileUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setUserPosts(data.posts);
      })
      .catch((err) => console.error(err))
      .finally(() => setPostsLoading(false));
  }, [profileUser]);

  // Sosyal hesapları getirme (kullanıcının profil id'sine göre)
  useEffect(() => {
    if (!profileUser?.id) return;
    async function fetchSocialAccounts() {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`/api/social-accounts?userId=${profileUser.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Social accounts fetch error:", errorData.message);
          setSocialAccounts([]);
          return;
        }
        const data = await res.json();
        setSocialAccounts(data.socialAccounts || []);
      } catch (error) {
        console.error("Social accounts fetch error:", error);
        setSocialAccounts([]);
      }
    }
    fetchSocialAccounts();
  }, [profileUser]);

  const handleFollow = async () => {
    if (!auth?.user || !profileUser) return;
    const action = isFollowing ? "unfollow" : "follow";
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ following_id: profileUser.id, action }),
      });
      if (res.ok) {
        setIsFollowing(!isFollowing);
        refetchProfile();
      } else if (res.status === 409) {
        alert("Zaten takip ediyorsunuz!");
      } else {
        console.error("Follow/unfollow işlemi başarısız");
      }
    } catch (error) {
      console.error("Follow/unfollow hatası:", error);
    }
  };

  const handleProfilePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageUrl = reader.result as string;
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("/api/users/profile-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, profile_image: imageUrl }),
        });
        if (res.ok) {
          setProfileUser((prev: any) => ({ ...prev, profile_image: imageUrl }));
        }
      } catch (error) {
        console.error("Profil fotoğrafı güncelleme hatası:", error);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverPhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageUrl = reader.result as string;
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("/api/users/cover-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, cover_image: imageUrl }),
        });
        if (res.ok) {
          setProfileUser((prev: any) => ({ ...prev, cover_image: imageUrl }));
        }
      } catch (error) {
        console.error("Kapak fotoğrafı güncelleme hatası:", error);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditProfileInfo = async () => {
    const newInfo = prompt("Profiliniz hakkında bilgi girin:", profileUser.profile_info || "");
    if (newInfo === null) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/users/profile-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, profile_info: newInfo }),
      });
      if (res.ok) {
        setProfileUser((prev: any) => ({ ...prev, profile_info: newInfo }));
      }
    } catch (error) {
      console.error("Profil bilgisi güncelleme hatası:", error);
    }
  };

  const isMyProfile =
    username === "profile" || (auth?.user && auth.user.username === username);

  if (!profileUser) {
    return <div className="p-4 text-center">Loading Profile...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFCF2]">
      {/* Üst Bar */}
      <div className="sticky top-0 z-10 backdrop-blur-md p-4 bg-black/60 flex items-center justify-between">
        <Link href="/">
          <Image1 path="icons/back.svg" alt="back" w={24} h={24} />
        </Link>
        <h1 className="font-bold text-lg text-black">@{profileUser.username}</h1>
        {isMyProfile ? (
          <Link href="/settings">
            <Image src="/icons/setting.png" alt="settings" width={24} height={24} />
          </Link>
        ) : (
          <div style={{ width: 24, height: 24 }}></div>
        )}
      </div>

      {/* Kapak + Profil Fotoğrafı + Follow Butonu Aynı Satırda */}
      <div className="relative w-full overflow-visible z-0">
        <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-[#A8DBF0] to-[#BDC4BF] shadow-lg relative z-0">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <input
            type="file"
            accept="image/*"
            ref={coverInputRef}
            className="hidden"
            onChange={handleCoverPhotoChange}
          />
        </div>

        <div className="absolute bottom-0 w-full flex items-center justify-between px-4 sm:px-7 translate-y-1/2">
          <div className="w-200 h-200 sm:w-150 sm:h-150 rounded-full overflow-hidden border-2 border-black bg-gray-300 z-50 relative">
            <Image
              src={profileUser.profile_image || "/icons/pp.png"}
              alt="Avatar"
              width={150}
              height={150}
            />
            {isMyProfile && (
              <>
                <button
                  onClick={() => profileInputRef.current?.click()}
                  className="absolute bottom-3 right-7 bg-white/50 hover:bg-white/80 text-black px-3 py-1 text-md rounded"
                >
                  Edit Photo
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={profileInputRef}
                  className="hidden"
                  onChange={handleProfilePhotoChange}
                />
              </>
            )}
          </div>

          {!isMyProfile && (
            <button
              onClick={handleFollow}
              className="py-2 px-3 bg-white text-black font-bold rounded-full shadow-md z-50"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
      </div>

      {/* Kullanıcı Bilgileri */}
      <div className="mt-20 p-4 flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{profileUser.full_name}</h1>
        <span className="text-black text-sm">@{profileUser.username}</span>
        <p>Level: {profileUser.level}</p>
        <p>Points: {profileUser.points}</p>
        <div className="flex gap-6 mt-2">
  <Link href={`/profile/${profileUser.username}/followers`} className="hover:underline">
    <span className="font-bold">{profileUser.follower_count || 0}</span> Followers
  </Link>
  <Link href={`/profile/${profileUser.username}/following`} className="hover:underline">
    <span className="font-bold">{profileUser.following_count || 0}</span> Following
  </Link>
</div>

        {/* Sosyal Medya Hesapları */}
        {socialAccounts?.length > 0 && (
          <div className="mt-4 p-4 bg-white rounded shadow">
            <h2 className="text-lg font-bold mb-2">Sosyal Medya Hesapları</h2>
            <ul className="space-y-2">
              {socialAccounts.map((account: any) => (
                <li key={account.id}>
                  <p>
                    <strong>{account.platform}</strong>:{" "}
                    <a href={account.accountLink} target="_blank" rel="noopener noreferrer">
                      {account.accountLink}
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* DİL SEÇİMİ DROPDOWN */}
        {isMyProfile && (
          <div className="mt-4 flex flex-col gap-2">
            <label htmlFor="targetLang" className="font-semibold text-black">
              Çeviri Dili
            </label>
            <select
              id="targetLang"
              value={targetLanguage}
              onChange={handleLanguageChange}
              className="border border-[#3E6A8A] bg-[#FAFCF2] rounded py-2 px-3 text-black outline-none focus:ring-2 focus:ring-[#A8DBF0] hover:bg-[#f0f9ff] transition"
            >
              <option value="tr">TR</option>
              <option value="en">EN</option>
              <option value="de">DE</option>
              <option value="es">ES</option>
              <option value="it">IT</option>
              <option value="ru">RU</option>
            </select>
          </div>
        )}
      </div>

      {/* Gönderiler */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Gönderiler</h2>
        {postsLoading ? (
          <p>Gönderiler yükleniyor...</p>
        ) : userPosts.length > 0 ? (
          userPosts.map((post) => <Post key={post.id} postData={post} />)
        ) : (
          <p>Henüz gönderi paylaşılmamış.</p>
        )}
      </div>
    </div>
  );
}
