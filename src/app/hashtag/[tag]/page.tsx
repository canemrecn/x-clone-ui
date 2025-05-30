import React from "react";
import Post from "@/components/Post";
import { PostData } from "@/components/Post";

async function fetchPostsByHashtag(tag: string): Promise<PostData[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/hashtag/${tag}`, {
    next: { revalidate: 10 },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.posts;
}

async function fetchTopHashtags(): Promise<{ tag: string; count: number }[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/hashtag-popular`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.topHashtags;
}

export default async function HashtagPage(props: any) {
  const tag = decodeURIComponent(props.params.tag);
  const posts = await fetchPostsByHashtag(tag);
  const topTags = await fetchTopHashtags();

  return (
    <div className="p-4 pt-24 pb-20">
      <h1 className="text-2xl font-bold text-white mb-6">#{tag} etiketiyle paylaşılanlar</h1>
      {posts.length === 0 ? (
        <p className="text-gray-400">Bu etikete ait gönderi bulunamadı.</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post: PostData) => (
            <Post key={post.id} postData={post} />
          ))}
        </div>
      )}
    </div>
  );
}
