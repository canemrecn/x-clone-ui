// src/app/admin/comments/page.tsx
// src/app/admin/comments/page.tsx

"use client"; // Bu satırı ekleyin

import { useEffect, useState } from "react";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch("/api/admin/comments");
        if (!res.ok) throw new Error("Yorumlar alınamadı");
        const data = await res.json();
        setComments(data.comments);
      } catch (error) {
        console.error("Yorumlar alınırken hata:", error);
      }
    }
    fetchComments();
  }, []);

  return (
    <div>
      <h1>Admin Yorumları</h1>
      <ul>
        {comments.map((comment: any) => (
          <li key={comment.id}>
            {comment.text} - {comment.username}
          </li>
        ))}
      </ul>
    </div>
  );
}
