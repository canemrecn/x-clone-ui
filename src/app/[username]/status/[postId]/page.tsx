//src/app/[username]/status/[postId]/page.tsx
//Bu dosya, belirli bir kullanıcının belirli bir gönderisini (/username/status/postId yoluyla) 
//görüntülemek için kullanılan bir React bileşenidir. URL'deki username ve postId parametrelerini alır, useSWR ile postId'ye 
//ait gönderi verisini /api/posts?post_id= üzerinden çeker, yüklenme ve hata durumlarını yönetir, eğer gönderi bulunursa Post 
//bileşeniyle gösterir; aksi takdirde uygun mesajları sunar. Ayrıca, üst kısımda geri dönüş (back) butonu ve gönderi başlığı yer 
//alır, sayfa şık bir arka plan ve kutu stiliyle düzenlenmiştir.
"use client";

import { useAuth } from "@/context/AuthContext";
import Post from "@/components/Post";
import Link from "next/link";
import useSWR from "swr";
import { PostData } from "@/components/Post";
import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// ✅ Geliştirilmiş fetcher
const fetcher = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      credentials: "include",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    }

    return res.json();
  } catch (err: any) {
    throw new Error(err.message || "Unknown fetch error");
  }
};

// ✅ Hatalı yapı: `params` tipi eksik => düzeltildi
type StatusPageProps = {
  params: {
    username: string;
    postId: string;
  };
};

export default function StatusPage({ params }: StatusPageProps) {
  const auth = useAuth();

  const { data, error, isValidating } = useSWR(
    `/api/posts?post_id=${params.postId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      errorRetryCount: 2,
      errorRetryInterval: 5000,
    }
  );

  const loading = !data && !error;
  const postData: PostData | null =
    data && data.posts && data.posts.length > 0 ? data.posts[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white">
      {/* Üst Kısım */}
      <div className="flex flex-wrap items-center gap-4 md:gap-8 sticky top-0 backdrop-blur-lg p-4 z-10 bg-gradient-to-br from-gray-800 to-gray-700 shadow-md">
        <Link href="/" className="hover:bg-gray-600 p-2 rounded transition">
          <Image src="/icons/left.png" alt="back" width={24} height={24} priority />
        </Link>
        <h1 className="font-bold text-base md:text-lg truncate">
          {params.username}'s Post (ID: {params.postId})
        </h1>
      </div>

      {/* İçerik Alanı */}
      <div className="w-full max-w-3xl mx-auto mt-6 p-4 sm:p-6 bg-gradient-to-br from-gray-800 to-gray-700 shadow-2xl rounded-xl border border-gray-300">
        {loading ? (
          <div className="p-4">
            <Skeleton height={200} borderRadius={12} />
            <div className="mt-4 space-y-2">
              <Skeleton width={`80%`} />
              <Skeleton width={`60%`} />
              <Skeleton width={`90%`} />
            </div>
          </div>
        ) : error ? (
          <p className="p-4 text-center text-red-400">Gönderi yüklenirken hata oluştu.</p>
        ) : !postData ? (
          <p className="p-4 text-center">Gönderi bulunamadı.</p>
        ) : (
          <Post postData={postData} />
        )}
      </div>
    </div>
  );
}
