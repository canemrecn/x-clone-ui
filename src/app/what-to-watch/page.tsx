//src/app/what-to-watch/page.tsx
/*Bu dosya, kullanıcılara rastgele bir film önerisi sunan ve dilerlerse yeni bir film (isim, afiş ve açıklama) yüklemelerine 
imkân tanıyan interaktif bir sayfa oluşturur; /api/movies üzerinden film verilerini çeker veya yeni film ekler, yüklenen 
görselleri Base64 formatında işler, kullanıcıya önerilen filmi ve detaylarını gösterir, hata ve başarı mesajlarını yansıtır 
ve ayrıca sayfa içinde örnek bir reklam bileşeni de sunar.*/
"use client";

import React, { useState, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Film arayüzü
interface Movie {
  title: string;
  poster: string;
  description: string;
}

// Basit reklam bileşeni
function AdPlaceholder() {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 rounded shadow-md mt-4">
      <p className="font-bold text-center">[ Reklam Alanı ]</p>
    </div>
  );
}

export default function WhatToWatchPage() {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadPoster, setUploadPoster] = useState(""); // Base64 string
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchRandomMovie = useCallback(async () => {
    try {
      const res = await fetch("/api/movies", {
        credentials: "include", // HTTP-only cookie ile doğrulama
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "No movies found.");
      }
      const data = await res.json();
      setMovie(data);
    } catch (err: any) {
      setError(err.message || "Error fetching movie.");
    }
  }, []);

  const handleUpload = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setUploadMessage("");
      setError("");
      setLoading(true);
      try {
        const res = await fetch("/api/movies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: uploadTitle,
            poster: uploadPoster,
            description: uploadDescription,
          }),
          credentials: "include", // HTTP-only cookie ile doğrulama
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Error uploading movie.");
        }
        setUploadMessage("Film uploaded successfully!");
        setUploadTitle("");
        setUploadPoster("");
        setUploadDescription("");
        setShowUploadForm(false);
        fetchRandomMovie();
      } catch (err: any) {
        setError(err.message || "Error uploading movie.");
      } finally {
        setLoading(false);
      }
    },
    [uploadTitle, uploadPoster, uploadDescription, fetchRandomMovie]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => setUploadPoster(reader.result as string);
      reader.readAsDataURL(file);
    },
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white flex flex-col items-center p-6">
      {/* Header */}
      <div className="w-full max-w-4xl bg-gradient-to-br from-gray-800 to-gray-800 border-b-8 border-gray-300 rounded-t-xl shadow-xl mb-8 p-6 text-center">
        <h2 className="text-3xl font-semibold">Bugün Ne İzlesem?</h2>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-4 text-white font-semibold">{error}</p>
      )}

      {/* Movie display */}
      {movie && (
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">{movie.title}</h2>
          <div className="flex justify-center mb-4">
            <Image
              src={movie.poster}
              alt={movie.title}
              width={500}
              height={500}
              className="rounded-lg shadow-lg object-cover"
            />
          </div>
          <p className="text-lg text-white">{movie.description}</p>

          {/* Reklam: Her film açıklamasının hemen altında */}
          <AdPlaceholder />
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-center gap-6 mb-8">
        <button
          onClick={() => setShowUploadForm((prev) => !prev)}
          className="bg-gradient-to-br from-gray-800 to-gray-800 text-white px-6 py-3 rounded-full hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition"
        >
          Film Yükle
        </button>
        <button
          onClick={fetchRandomMovie}
          className="bg-gradient-to-br from-gray-800 to-gray-800 text-white px-6 py-3 rounded-full hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition"
        >
          Rastgele Film Göster
        </button>
      </div>

      {/* Upload form */}
      {showUploadForm && (
        <form
          onSubmit={handleUpload}
          className="space-y-6 text-left mx-auto max-w-xl"
        >
          <div>
            <label className="block text-lg font-medium text-white">
              Film Adı
            </label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
              required
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-white">
              Film Afiş Resmi (Dosya)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full bg-gradient-to-br from-gray-800 to-gray-800 p-2 rounded text-white"
              accept="image/*"
              required
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-white">
              Film Açıklaması
            </label>
            <textarea
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none focus:ring-2 focus:ring-gray-600"
              rows={4}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-gray-800 to-gray-700 text-white px-6 py-3 rounded-full hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition"
          >
            {loading ? "Yükleniyor..." : "Film Yükle"}
          </button>
          {uploadMessage && (
            <p className="text-center text-white text-xl font-semibold">
              {uploadMessage}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
