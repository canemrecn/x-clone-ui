//src/app/[username]/page.tsx
//Bu dosya, bir kullanıcının profil sayfasını oluşturan React bileşenidir; URL'deki username parametresine göre ilgili kullanıcı bilgilerini, 
//gönderilerini ve sosyal medya hesaplarını useSWR ile API'den çeker, profil ve kapak fotoğraflarının yanı sıra profil bilgilerini düzenleme, 
//dil seçimi yapma, takip etme/bırakma ve engelleme işlemlerine izin verir. Ayrıca kullanıcıya ait her 5 gönderiden sonra bir reklam kutusu ekler 
//ve eğer username bir dil koduysa, dil anasayfasını gösterir. Görsel ve fonksiyonel olarak zenginleştirilmiş, kişisel profil görüntüleme ve etkileşim sayfasıdır.
//src/app/[username]/page.tsx

// src/app/[username]/page.tsx
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
    username !== "profile" ? `/api/users/get-by-username?username=${username}` : null,
    fetcher, swrConfig
  );

  const profileUser = username === "profile" ? auth?.user : userData?.user;

  const { data: postsData } = useSWR(
    profileUser?.id ? `/api/posts?user_id=${profileUser.id}` : null,
    fetcher, swrConfig
  );
  const userPosts = postsData?.posts || [];

  const { data: socialData } = useSWR(
    profileUser?.id ? `/api/social-accounts?userId=${profileUser.id}` : null,
    fetcher, swrConfig
  );
  const socialAccounts = socialData?.socialAccounts || [];

  const { data: followingData, mutate: mutateFollowing } = useSWR(
    profileUser?.id && auth?.user
      ? `/api/follows/status?user_id=${auth.user.id}&following_id=${profileUser.id}`
      : null,
    fetcher, swrConfig
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

  const isMyProfile = username === "profile" || (auth?.user && auth.user.username === username);

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6">
        <Skeleton height={220} borderRadius={10} />
        <div className="flex gap-4 items-center mt-6">
          <Skeleton circle width={100} height={100} />
          <div className="flex-1 space-y-2">
            <Skeleton width="40%" />
            <Skeleton width="60%" />
          </div>
        </div>
        <div className="space-y-3 mt-4">
          <Skeleton width="30%" />
          <Skeleton width="20%" />
          <Skeleton width="35%" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white pt-20 pb-20">
      <div className="sticky top-0 z-10 backdrop-blur-md p-4 bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-between flex-wrap shadow-md">
        <Link href="/">
          <Image src="/icons/left.png" alt="back" width={24} height={24} priority className="hover:bg-gray-600 p-1 rounded transition" />
        </Link>
        <h1 className="font-bold text-base md:text-lg">@{profileUser.username}</h1>
        {isMyProfile ? (
          <Link href="/settings">
            <Image src="/icons/setting.png" alt="settings" width={24} height={24} priority className="hover:bg-gray-600 p-1 rounded transition" />
          </Link>
        ) : <div style={{ width: 24, height: 24 }}></div>}
      </div>

      <div className="mt-20 p-4 flex flex-col gap-3">
        <h1 className="text-2xl font-bold">{profileUser.full_name}</h1>
        <span className="text-sm">@{profileUser.username}</span>
        <p className="text-gray-300">Level: {profileUser.level} | Points: {profileUser.points}</p>
        <p className="text-xs text-gray-400">ID: {profileUser.id}</p>

        {isMyProfile && (
          <div className="mt-3">
            <label htmlFor="targetLang" className="block text-sm font-medium text-white">Çeviri Dili</label>
            <select
              id="targetLang"
              value={targetLanguage}
              onChange={handleLanguageChange}
              className="mt-1 block w-full rounded-md bg-gray-900 text-white border border-gray-700 p-2"
            >
              <option value="tr">Türkçe</option>
              <option value="en">İngilizce</option>
              <option value="de">Almanca</option>
              <option value="es">İspanyolca</option>
              <option value="it">İtalyanca</option>
              <option value="ru">Rusça</option>
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
            item.isAd ? <AdPlaceholder key={item.id} /> : <Post key={item.id} postData={item} />
          )
        ) : (
          <p>Henüz gönderi paylaşılmamış.</p>
        )}
      </div>
    </div>
  );
}
