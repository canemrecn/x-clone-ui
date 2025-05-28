// src/components/Search.tsx
/*Bu dosya, kullanıcıların diğer kullanıcıları arayabileceği bir arama bileşeni (Search) tanımlar. Kullanıcı input 
alanına bir şeyler yazdığında, girilen sorguya göre /api/search endpoint’ine fetch isteği gönderir, sonuçları alır 
ve eşleşen kullanıcıları dropdown şeklinde gösterir. Arama kutusu, şık bir şekilde stillendirilmiş olup arama simgesi 
ve girilen metne göre anlık sonuç listesini kullanıcıya sunar.*/
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Search() {
  const [query, setQuery] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [tagResults, setTagResults] = useState<any[]>([]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setUserResults([]);
      setTagResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const isHashtag = query.trim().startsWith("#");
      const cleanQuery = isHashtag ? query.trim().slice(1) : query.trim();

      const endpoint = isHashtag
        ? `/api/search-tags?query=${encodeURIComponent(cleanQuery)}`
        : `/api/search?query=${encodeURIComponent(cleanQuery)}`;

      fetch(endpoint, { credentials: "include" })
        .then((res) => {
          if (!res.ok) throw new Error(`Error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (isHashtag) {
            setTagResults(data.tags || []);
            setUserResults([]);
          } else {
            setUserResults(data.results || []);
            setTagResults([]);
          }
        })
        .catch((err) => {
          console.error("Search error:", err);
          setUserResults([]);
          setTagResults([]);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-700 py-2 px-4 flex flex-col gap-2 rounded-full shadow-md text-white w-full max-w-md">
      {/* Search input */}
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
          className="flex-1 rounded px-2 py-1 bg-transparent text-white outline-none placeholder-white"
          onChange={handleChange}
          value={query}
        />
      </div>

      {/* Dropdown for results */}
      {(userResults.length > 0 || tagResults.length > 0) && (
        <div className="absolute top-full mt-2 left-0 w-full bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-300 rounded-md p-2 z-50 shadow-lg max-h-[300px] overflow-y-auto">
          {userResults.map((r) => (
            <Link
              key={r.id}
              href={`/${r.username}`}
              className="block p-2 rounded hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition text-white"
            >
              {r.full_name} (@{r.username})
            </Link>
          ))}

          {tagResults.map((tag: { tag: string; count: number }) => (
            <Link
              key={tag.tag}
              href={`/hashtag/${encodeURIComponent(tag.tag)}`}
              className="block p-2 rounded hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition text-white"
            >
              #{tag.tag} ({tag.count})
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
