"use client";

import Share from "./Share";
import Post from "./Post";
import { useState, useEffect } from "react";

interface LanguageFeedProps {
  lang: string;
}

export default function LanguageFeed({ lang }: LanguageFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // GET -> /api/posts?lang=...
    fetch(`/api/posts?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lang]);

  return (
    <div className="p-4">
      <h1>{lang.toUpperCase()} PAGE</h1>

      {/* 1) BURADA Share'e lang prop'u veriyoruz */}
      <Share lang={lang} />

      {loading ? (
        <p>Loading...</p>
      ) : (
        posts.map((p) => <Post key={p.id} postData={p} />)
      )}
    </div>
  );
}
