//src/app/[username]/page.tsx
//Bu dosya, bir kullanıcının profil sayfasını oluşturan React bileşenidir; URL'deki username parametresine göre ilgili kullanıcı bilgilerini, 
//gönderilerini ve sosyal medya hesaplarını useSWR ile API'den çeker, profil ve kapak fotoğraflarının yanı sıra profil bilgilerini düzenleme, 
//dil seçimi yapma, takip etme/bırakma ve engelleme işlemlerine izin verir. Ayrıca kullanıcıya ait her 5 gönderiden sonra bir reklam kutusu ekler 
//ve eğer username bir dil koduysa, dil anasayfasını gösterir. Görsel ve fonksiyonel olarak zenginleştirilmiş, kişisel profil görüntüleme ve etkileşim sayfasıdır.
//src/app/[username]/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Post from "@/components/Post";
import LanguageHome from "@/components/LanguageHome";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function AdPlaceholder() {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 rounded shadow-md my-4">
      <p className="font-bold text-center">[ Reklam Alanı ]</p>
    </div>
  );
}

const fetcher = async (url: string, options?: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: "include",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    throw new Error(`İstek başarısız: ${error.message}`);
  }
};

const swrConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 10000,
  errorRetryCount: 2,
  errorRetryInterval: 5000,
};

export default function UserPage() {
  const auth = useAuth();
  const { username } = useParams() as { username: string };

  const languageCodes = ["en", "de", "it", "es", "ru"];
  if (languageCodes.includes(username)) {
    return <LanguageHome lang={username} />;
  }

  const { data: userData, mutate: refetchProfile } = useSWR(
    username !== "profile"
      ? `/api/users/get-by-username?username=${username}`
      : null,
    fetcher,
    swrConfig
  );
  const profileUser = username === "profile" ? auth?.user : userData?.user;

  const { data: postsData } = useSWR(
    profileUser?.id ? `/api/posts?user_id=${profileUser.id}` : null,
    fetcher,
    swrConfig
  );
  const userPosts = postsData?.posts || [];

  const { data: socialData } = useSWR(
    profileUser?.id ? `/api/social-accounts?userId=${profileUser.id}` : null,
    fetcher,
    swrConfig
  );
  const socialAccounts = socialData?.socialAccounts || [];

  const { data: followingData, mutate: mutateFollowing } = useSWR(
    profileUser?.id && auth?.user
      ? `/api/follows/status?user_id=${auth.user.id}&following_id=${profileUser.id}`
      : null,
    fetcher,
    swrConfig
  );
  const isFollowing = followingData?.isFollowing || false;

  const [targetLanguage, setTargetLanguage] = useState("tr");
  useEffect(() => {
    const savedLang = localStorage.getItem("targetLanguage");
    if (savedLang) setTargetLanguage(savedLang);
  }, []);

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setTargetLanguage(newLang);
    localStorage.setItem("targetLanguage", newLang);
  };

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleFollow = async () => {
    if (!auth?.user || !profileUser) return;
    const action = isFollowing ? "unfollow" : "follow";
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ following_id: profileUser.id, action }),
      });
      if (res.ok) {
        mutateFollowing();
        refetchProfile();
      }
    } catch (error) {
      console.error("Takip/Çıkarma hatası:", error);
    }
  };

  const handleProfilePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageUrl = reader.result as string;
      try {
        const res = await fetch("/api/users/profile-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Cookie ile token gidiyor
          body: JSON.stringify({ profile_image: imageUrl }),
        });
        if (res.ok) refetchProfile();
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
      try {
        const res = await fetch("/api/users/cover-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ cover_image: imageUrl }),
        });
        if (res.ok) refetchProfile();
      } catch (error) {
        console.error("Kapak fotoğrafı güncelleme hatası:", error);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditProfileInfo = async () => {
    const newInfo = prompt("Profiliniz hakkında bilgi girin:", profileUser?.profile_info || "");
    if (newInfo === null) return;
    try {
      const res = await fetch("/api/users/profile-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profile_info: newInfo }),
      });
      if (res.ok) refetchProfile();
    } catch (error) {
      console.error("Profil bilgisi güncelleme hatası:", error);
    }
  };

  const isMyProfile = username === "profile" || (auth?.user && auth.user.username === username);

  const handleBlock = async () => {
    if (!auth?.user || !profileUser) return;
    try {
      const res = await fetch("/api/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ blockedUserId: profileUser.id }),
      });
      if (res.ok) alert("Kullanıcı engellendi!");
    } catch (error) {
      console.error("Engelleme hatası:", error);
    }
  };

  if (!profileUser) {
    return (
      <div className="min-h-screen text-white p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton height={220} borderRadius={10} />
          <div className="flex gap-4 items-center">
            <Skeleton circle width={100} height={100} />
            <div className="flex-1 space-y-2">
              <Skeleton width="40%" />
              <Skeleton width="60%" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton width="30%" />
            <Skeleton width="20%" />
            <Skeleton width="35%" />
          </div>
        </div>
      </div>
    );
  }

  const finalPosts = [];
  for (let i = 0; i < userPosts.length; i++) {
    finalPosts.push(userPosts[i]);
    if ((i + 1) % 5 === 0) {
      finalPosts.push({ isAd: true, id: `ad-${i}` });
    }
  }

  return (
    <div className="min-h-screen text-white pt-20 pb-20">
      <div className="sticky top-0 z-10 backdrop-blur-md p-4 bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-between flex-wrap shadow-md">
        <Link href="/">
          <Image src="/icons/left.png" alt="back" width={24} height={24} priority className="hover:bg-gray-600 p-1 rounded transition" />
        </Link>
        <h1 className="font-bold text-base md:text-lg">@{profileUser.username}</h1>
        {isMyProfile ? (
          <Link href="/settings">
            <Image src="/icons/setting.png" alt="settings" width={24} height={24} priority className="hover:bg-gray-600 p-1 rounded transition" />
          </Link>
        ) : (
          <div style={{ width: 24, height: 24 }}></div>
        )}
      </div>

      <div className="relative w-full">
        <div
          className="w-full h-48 sm:h-64 bg-cover bg-center shadow-lg relative"
          style={{ backgroundImage: "url('/icons/bg2.png')" }}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <input
            type="file"
            accept="image/*"
            ref={coverInputRef}
            className="hidden"
            onChange={handleCoverPhotoChange}
          />
        </div>


        <div className="absolute bottom-0 w-full flex flex-col sm:flex-row items-center justify-between px-4 sm:px-7 translate-y-1/2">
          <div className="relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-black bg-gradient-to-br from-gray-800 to-gray-700 shadow-2xl">
              <Image
                src={profileUser.profile_image || "/icons/pp.png"}
                alt="Avatar"
                width={160}
                height={160}
                className="object-cover"
                priority
                placeholder="blur"
                blurDataURL="/icons/pp.png"
              />
            </div>
            {isMyProfile && (
              <>
                <button onClick={() => profileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-gray-800/50 hover:bg-gray-600/80 text-white px-2 py-1 text-xs rounded transition">
                  Edit Photo
                </button>
                <input type="file" accept="image/*" ref={profileInputRef} className="hidden" onChange={handleProfilePhotoChange} />
              </>
            )}
          </div>

          {!isMyProfile && (
            <div className="flex gap-2 mt-4 sm:mt-0">
              <button onClick={handleFollow} className="py-2 px-3 bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-bold rounded-full shadow-md transition">
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
              <button onClick={handleBlock} className="py-2 px-3 bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-bold rounded-full shadow-md transition">
                Engelle
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-20 p-4 flex flex-col gap-2 bg-gradient-to-br from-gray-800 to-gray-700">
        <h1 className="text-2xl font-bold">{profileUser.full_name}</h1>
        <span className="text-sm">@{profileUser.username}</span>
        <p>Level: {profileUser.level}</p>
        <p>Points: {profileUser.points}</p>
        <p className="text-xs text-gray-400">Kullanıcı ID: {profileUser.id}</p>

        <div className="flex flex-wrap gap-4 mt-2">
          <Link href={`/profile/${profileUser.username}/followers`} className="hover:underline hover:text-cyan-400 text-white">
            <span className="font-bold">{profileUser.follower_count || 0}</span> Followers
          </Link>
          <Link href={`/profile/${profileUser.username}/following`} className="hover:underline hover:text-cyan-400 text-white">
            <span className="font-bold">{profileUser.following_count || 0}</span> Following
          </Link>
        </div>

        {socialAccounts?.length > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-br from-gray-800 to-gray-700 rounded shadow">
            <h2 className="text-lg font-bold mb-2">Sosyal Medya Hesapları</h2>
            <ul className="space-y-2">
              {socialAccounts.map((account: any) => (
                <li key={account.id}>
                  <p>
                    <strong>{account.platform}</strong>: {" "}
                    <a href={account.accountLink} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition">
                      {account.accountLink}
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isMyProfile && (
          <div className="mt-4 flex flex-col gap-2">
            <label htmlFor="targetLang" className="font-semibold">Çeviri Dili</label>
            <select
              id="targetLang"
              value={targetLanguage}
              onChange={handleLanguageChange}
              className="border border-gray-300 bg-gradient-to-br from-gray-800 to-gray-700 rounded py-2 px-3 text-white outline-none focus:ring-2 focus:ring-gray-600 hover:bg-gray-600 transition"
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

      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Gönderiler</h2>
        {postsData === undefined ? (
          [...Array(3)].map((_, idx) => (
            <div key={idx} className="mb-4">
              <Skeleton height={180} borderRadius={10} />
              <div className="mt-2 space-y-2">
                <Skeleton width="80%" />
                <Skeleton width="60%" />
                <Skeleton width="90%" />
              </div>
            </div>
          ))
        ) : userPosts.length > 0 ? (
          finalPosts.map((item: any) =>
            item.isAd ? (
              <AdPlaceholder key={item.id} />
            ) : (
              <Post key={item.id} postData={item} />
            )
          )
        ) : (
          <p>Henüz gönderi paylaşılmamış.</p>
        )}
      </div>
    </div>
  );
}
