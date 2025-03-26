"use client";

import { useAuth } from "@/context/AuthContext";
import Post from "@/components/Post";
import Comments from "@/components/Comments";
import Image1 from "@/components/image";
import Link from "next/link";
import useSWR from "swr";
import { PostData } from "@/components/Post";
import Image from "next/image";

// Geliştirilmiş fetcher: AbortController ve hata denetimi eklendi.
const fetcher = (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 saniyelik zaman aşımı

  return fetch(url, { signal: controller.signal })
    .then((res) => {
      clearTimeout(timeoutId);
      if (!res.ok) {
        throw new Error(`Network response was not ok (status: ${res.status})`);
      }
      return res.json();
    });
};

export default function StatusPage({
  params,
}: {
  params: { username: string; postId: string };
}) {
  const auth = useAuth();

  // useSWR yapılandırmasına revalidateOnFocus eklenerek gereksiz istekler engellendi.
  const { data, error } = useSWR(`/api/posts?post_id=${params.postId}`, fetcher, {
    revalidateOnFocus: false,
  });

  const loading = !data && !error;
  const postData: PostData | null =
    data && data.posts && data.posts.length > 0 ? data.posts[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white">
      {/* Üst Kısım */}
      <div className="flex flex-wrap items-center gap-4 md:gap-8 sticky top-0 backdrop-blur-lg p-4 z-10 bg-gradient-to-br from-gray-800 to-gray-700 shadow-md">
        <Link href="/" className="hover:bg-gray-600 p-2 rounded transition">
          <Image src="/icons/left.png" alt="back" width={24} height={24} />
        </Link>
        <h1 className="font-bold text-base md:text-lg">
          {params.username}'s Post (ID: {params.postId})
        </h1>
      </div>

      {/* İçerik Alanı */}
      <div className="w-full max-w-3xl mx-auto mt-6 p-4 sm:p-6 bg-gradient-to-br from-gray-800 to-gray-700 shadow-2xl rounded-xl border border-gray-300">
        {loading ? (
          <p className="p-4 text-center">Loading post...</p>
        ) : !postData ? (
          <p className="p-4 text-center">Post not found.</p>
        ) : (
          <div>
            <Post postData={postData} />
            {/* <Comments postId={Number(params.postId)} /> */}
          </div>
        )}
      </div>
    </div>
  );
}
