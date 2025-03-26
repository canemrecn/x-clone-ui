"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Feed from "./Feed"; // Kullanıcının gönderilerini gösteren Feed bileşeni
import Share from "./Share";

interface UserProfileProps {
  username: string;
  auth: any;
}

export default function UserProfile({ username, auth }: UserProfileProps) {
  const router = useRouter();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  async function fetchUser(username: string) {
    const res = await fetch(`/api/users/get-by-username?username=${username}`);
    if (!res.ok) throw new Error("User not found");
    const data = await res.json();
    return data.user;
  }

  useEffect(() => {
    if (!username) return;
    fetchUser(username)
      .then((userData) => {
        setProfileUser(userData);
      })
      .catch((err) => {
        console.error(err);
        // Hata durumunda kullanıcı bulunamadı mesajı veya yönlendirme ekleyebilirsiniz.
      });
  }, [username]);

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

  if (!profileUser) {
    return <div className="p-4 text-center">User not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFCF2]">
      <h1 className="text-2xl font-bold text-center my-4">@{profileUser.username}</h1>
      <Share />
      {postsLoading ? (
        <p className="text-center">Loading posts...</p>
      ) : (
        <Feed posts={userPosts} />
      )}
    </div>
  );
}
