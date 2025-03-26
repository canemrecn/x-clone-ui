"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`Error fetching posts: ${res.status}`);
    }
    return res.json();
  });

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

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
    <div className=" bg-gradient-to-br from-gray-800 to-gray-700 py-2 px-4 flex flex-col gap-2 rounded-full shadow-md text-white">
      <div className="flex items-center gap-2">
        <Image
          src="https://ik.imagekit.io/n6qnlu3rx/tr:q-20,bl-6/icons/explore.svg"
          alt="Explore"
          width={24}
          height={24}
        />
        <input
          type="text"
          placeholder="Search..."
          className=" rounded px-2 py-1 bg-gradient-to-br from-gray-800 to-gray-700 text-white outline-none"
          onChange={handleChange}
          value={query}
        />
      </div>

      {results.length > 0 && (
        <div className="absolute top-12 left-0 w-full bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-300 rounded-md p-2 z-50 shadow-lg text-white">
          {results.map((r) => (
            <div key={r.id} className="p-2 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 rounded transition">
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
