import React from "react";
import { notFound } from "next/navigation";
import Post from "@/components/Post";
import { PostData } from "@/components/Post";

type PageProps = {
  params: { tag: string };
};

async function fetchPostsByHashtag(tag: string): Promise<PostData[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/hashtag/${tag}`, {
    next: { revalidate: 10 },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.posts;
}

export default async function HashtagPage(props: PageProps) {
  const tag = decodeURIComponent(props.params.tag);
  const posts = await fetchPostsByHashtag(tag);

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center text-gray-300 p-8">
        <h1 className="text-2xl font-bold mb-4">#{tag}</h1>
        <p>Bu etikete ait gönderi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">#{tag} etiketiyle paylaşılanlar</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <Post key={post.id} postData={post} />
        ))}
      </div>
    </div>
  );
}
