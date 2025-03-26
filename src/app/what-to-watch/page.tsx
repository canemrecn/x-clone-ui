"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Movie {
  title: string;
  poster: string;
  description: string;
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

  const fetchRandomMovie = async () => {
    try {
      const res = await fetch("/api/movies");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "No movies found.");
      }
      const data = await res.json();
      setMovie(data);
    } catch (err: any) {
      setError(err.message || "Error fetching movie.");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUploadPoster(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center p-6">
      {/* Header */}
      <div className="w-full max-w-4xl bg-white border-b-8 border-red-700 rounded-t-xl shadow-xl mb-8 p-6 text-center">
        <h2 className="text-3xl font-semibold text-red-700">Bugün Ne İzlesem?</h2>
      </div>

      {/* İçerik Alanı */}

        {error && <p className="mt-4 text-red-500 font-semibold">{error}</p>}
        {movie && (
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-black mb-4">{movie.title}</h2>
            <div className="flex justify-center mb-4">
              <Image
                src={movie.poster}
                alt={movie.title}
                width={500}
                height={500}
                className="rounded-lg shadow-lg object-cover"
              />
            </div>
            <p className="text-lg text-gray-700">{movie.description}</p>
          </div>
        )}
        <div className="flex justify-center gap-6 mb-8">
          <button
            onClick={() => setShowUploadForm((prev) => !prev)}
            className="bg-red-700 text-white px-6 py-3 rounded-full hover:bg-red-800 transition"
          >
            Film Yükle
          </button>
          <button
            onClick={fetchRandomMovie}
            className="bg-green-700 text-white px-6 py-3 rounded-full hover:bg-green-800 transition"
          >
            Rastgele Film Göster
          </button>
        </div>
        {showUploadForm && (
          <form
            onSubmit={handleUpload}
            className="space-y-6 text-left mx-auto max-w-xl"
          >
            <div>
              <label className="block text-lg font-medium text-black">
                Film Adı
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-3 bg-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-black">
                Film Afiş Resmi (Dosya)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="mt-1 block w-full bg-gray-100 p-2 rounded"
                accept="image/*"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-black">
                Film Açıklaması
              </label>
              <textarea
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-3 bg-gray-100"
                rows={4}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 text-white px-6 py-3 rounded-full hover:bg-red-800 transition"
            >
              {loading ? "Yükleniyor..." : "Film Yükle"}
            </button>
            {uploadMessage && (
              <p className="text-center text-green-600 text-xl font-semibold">
                {uploadMessage}
              </p>
            )}
          </form>
        )}

    </div>
  );
}
