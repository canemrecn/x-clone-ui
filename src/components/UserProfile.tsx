//src/components/UserProfile.tsx
/*Bu dosya, verilen kullanıcı adını (username) kullanarak ilgili kullanıcının bilgilerini ve gönderilerini 
/api/users/get-by-username ve /api/posts endpoint’lerinden SWR kütüphanesi ile çeken, ardından bu kullanıcıya 
ait profili ve gönderi akışını (Feed) görüntüleyen UserProfile bileşenini tanımlar; ayrıca kullanıcı oturum 
açmışsa gönderi paylaşma bileşeni (Share) da gösterilir.*/
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Feed from "./Feed";
import Share from "./Share";

interface UserProfileProps {
  username: string;
  auth: any;
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }
    return res.json();
  });

export default function UserProfile({ username, auth }: UserProfileProps) {
  const router = useRouter();

  // Fetch user data using SWR
  const { data: userData, error: userError } = useSWR(
    username ? `/api/users/get-by-username?username=${username}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Fetch posts after user data is available
  const { data: postsData, error: postsError } = useSWR(
    userData && userData.user && userData.user.id
      ? `/api/posts?user_id=${userData.user.id}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (userError) {
    return <div className="p-4 text-center text-white">User not found.</div>;
  }

  if (!userData || !postsData) {
    return <div className="p-4 text-center text-white">Loading...</div>;
  }

  const profileUser = userData.user;
  const userPosts = postsData.posts || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white">
      <h1 className="text-2xl font-bold text-center my-4 bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded shadow-md">
        @{profileUser.username}
      </h1>
      <Share lang={profileUser.lang || "en"} />
      {postsError ? (
        <p className="text-center">Error loading posts.</p>
      ) : (
        <Feed posts={userPosts} />
      )}
    </div>
  );
}
