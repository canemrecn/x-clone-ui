"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Post, { PostData } from "@/components/Post";
import Comments from "@/components/Comments";

const fetcher = (url: string) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return res.json();
  });
};

export default function PostDetailPage() {
  const { postId } = useParams() as { postId: string };

  const { data, error } = useSWR<{ posts: PostData[] }>(
    `/api/posts?post_id=${postId}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (!data && !error) {
    return (
      <p className="p-4 text-center text-white">
        Loading post...
      </p>
    );
  }

  if (error) {
    return (
      <p className="p-4 text-center text-white">
        Post not found
      </p>
    );
  }

  const postData = data?.posts && data.posts.length > 0 ? data.posts[0] : null;

  if (!postData) {
    return (
      <p className="p-4 text-center text-white">
        Post not found
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4">
      <Post postData={postData} />
      <Comments postId={Number(postId)} />
    </div>
  );
}
