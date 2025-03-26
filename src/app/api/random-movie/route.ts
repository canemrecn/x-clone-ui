// src/app/api/movies/random/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // TMDb API anahtarı kontrol ediliyor.
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB_API_KEY is not defined in environment variables.");
    }

    // TMDb üzerinden popüler filmleri çekiyoruz. Dil ve sayfa parametreleri isteğe bağlı olarak belirleniyor.
    const tmdbRes = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`
    );
    if (!tmdbRes.ok) {
      throw new Error("Error fetching movies from TMDb.");
    }

    const tmdbData = await tmdbRes.json();
    const movies = tmdbData.results;
    if (!movies || movies.length === 0) {
      throw new Error("No movies found.");
    }

    // Rastgele bir film seçiliyor.
    const randomIndex = Math.floor(Math.random() * movies.length);
    const randomMovie = movies[randomIndex];

    // Film afişi URL'si: TMDb, poster_path ile sağlanıyor. Eğer poster yoksa yerel yedek görsel kullanılıyor.
    const poster = randomMovie.poster_path
      ? `https://image.tmdb.org/t/p/w500${randomMovie.poster_path}`
      : "/images/no-poster.png";

    // Film bilgileri bir obje halinde hazırlanıyor.
    const movie = {
      poster,
      title: randomMovie.title,
      description: randomMovie.overview,
    };

    // Performans iyileştirmesi için önbellekleme başlığı ekleniyor.
    return NextResponse.json(movie, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" }
    });
  } catch (error: any) {
    console.error("Random movie API error:", error);
    return NextResponse.json(
      { message: error.message || "Error fetching random movie." },
      { status: 500 }
    );
  }
}
