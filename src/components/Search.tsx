// src/components/Search.tsx
"use client";

import { useState, useEffect } from "react";
import Image1 from "./image";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/search?query=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results || []);
        })
        .catch((err) => console.error(err));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="fixed top-2 right-2 lg:relative lg:top-0 lg:right-0 bg-[#FAFCF2] py-2 px-4 flex flex-col gap-2 rounded-full relative shadow-md">
      <div className="flex items-center gap-4">
        <Image1 path="icons/explore.svg" alt="search" w={16} h={16} />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none placeholder:text-textGray flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {results.length > 0 && (
        <div className="absolute top-12 left-0 w-full bg-white border border-gray-600 rounded-md p-2 z-50 shadow-lg">
          {results.map((r) => (
            <div key={r.id} className="p-2 hover:bg-gray-800 rounded">
              <a href={`/${r.username}`}>
                {r.full_name} (@{r.username})
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
