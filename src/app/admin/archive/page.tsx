// src/app/admin/archive/page.tsx
"use client";
import { useEffect, useState } from "react";

export default function ArchivePage() {
  const [archivedPosts, setArchivedPosts] = useState<any[]>([]);
  const [archivedComments, setArchivedComments] = useState<any[]>([]);
  const [archivedUsers, setArchivedUsers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchArchivedData() {
      const resPosts = await fetch("/api/admin/archived-posts");
      const posts = await resPosts.json();
      setArchivedPosts(posts);

      const resComments = await fetch("/api/admin/archived-comments");
      const comments = await resComments.json();
      setArchivedComments(comments);

      const resUsers = await fetch("/api/admin/archived-users");
      const users = await resUsers.json();
      setArchivedUsers(users);
    }

    fetchArchivedData();
  }, []);

  return (
    <div>
      <h1>Arşiv Verileri</h1>
      <h2>Silinen Gönderiler</h2>
      <ul>
        {archivedPosts.map((post) => (
          <li key={post.id}>
            {post.title} - {post.deleted_at}
          </li>
        ))}
      </ul>

      <h2>Silinen Yorumlar</h2>
      <ul>
        {archivedComments.map((comment) => (
          <li key={comment.id}>
            {comment.text} - {comment.deleted_at}
          </li>
        ))}
      </ul>

      <h2>Silinen Kullanıcılar</h2>
      <ul>
        {archivedUsers.map((user) => (
          <li key={user.id}>
            {user.username} - {user.deleted_at}
          </li>
        ))}
      </ul>
    </div>
  );
}
