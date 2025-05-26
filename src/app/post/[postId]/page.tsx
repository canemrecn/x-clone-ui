//src/app/post/[postId]/page.tsx
/*Bu dosya, belirli bir gönderinin (postId) detay sayfasını oluşturur; SWR ile /api/posts?post_id=... endpoint’inden gönderi verisini çeker, 
başarılıysa Post bileşeni ile gönderiyi ve Comments bileşeni ile ilgili yorumları ekranda gösterir, yüklenme veya hata durumlarında 
kullanıcıya uygun mesajlar sunar.*/
//src/app/post/[postId]/page.tsx
/*Bu dosya, belirli bir gönderinin (postId) detay sayfasını oluşturur; SWR ile /api/posts?post_id=... endpoint’inden gönderi verisini çeker, 
başarılıysa Post bileşeni ile gönderiyi ve Comments bileşeni ile ilgili yorumları ekranda gösterir, yüklenme veya hata durumlarında 
kullanıcıya uygun mesajlar sunar.*/
"use client";

import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import Post, { PostData } from "@/components/Post";
import Comments from "@/components/Comments";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";

const fetcher = (url: string) => {
  const token = Cookies.get("token");
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
    credentials: "include",
  }).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return res.json();
  });
};

export default function PostDetailPage() {
  const { postId } = useParams() as { postId?: string };
  const router = useRouter();
  const { user } = useAuth();

  if (!postId) {
    return <p className="p-4 text-center text-white">Gönderi yükleniyor...</p>;
  }

  const { data, error } = useSWR<{ posts: PostData[] }>(
    `/api/posts?post_id=${postId}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (!data && !error) {
    return <p className="p-4 text-center text-white">Gönderi yükleniyor...</p>;
  }

  if (error) {
    return <p className="p-4 text-center text-red-400">Gönderi bulunamadı</p>;
  }

  const postData = data?.posts && data.posts.length > 0 ? data.posts[0] : null;

  if (!postData) {
    return <p className="p-4 text-center text-white">Gönderi bulunamadı</p>;
  }

  const handleDelete = async () => {
    const confirm = window.confirm("Gönderiyi silmek istediğinize emin misiniz?");
    if (!confirm) return;

    try {
      const res = await fetch(`/api/posts/delete/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Silinemedi");

      alert("Gönderi başarıyla silindi.");
      router.push("/");
    } catch (err) {
      alert("Silme işlemi başarısız oldu.");
    }
  };

  const handleReport = async () => {
    try {
      const res = await fetch(`/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ post_id: postId }),
      });

      if (!res.ok) throw new Error("Şikayet başarısız");

      alert("Gönderi şikayet edildi.");
    } catch (err) {
      alert("Şikayet işlemi başarısız oldu.");
    }
  };

  return (
    <div className="min-h-screen text-white p-4 pt-24 pb-20">
      <Post postData={postData} />
      <div className="mt-4 flex gap-2">
        {user?.role === "admin" && (
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Gönderiyi Sil
          </button>
        )}
      </div>
      <Comments postId={Number(postId)} />
    </div>
  );
}
