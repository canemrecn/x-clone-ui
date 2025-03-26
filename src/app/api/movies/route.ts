// src/app/api/movies/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

/**
 * POST: Yeni film yükler.
 * Beklenen JSON: { title, poster, description }
 */
export async function POST(request: Request) {
  try {
    // İstek gövdesinden title, poster ve description alanlarını alıyoruz.
    const { title, poster, description } = await request.json();

    // Giriş verilerini temizleyip, trim ediyoruz.
    const trimmedTitle = typeof title === "string" ? title.trim() : "";
    const trimmedPoster = typeof poster === "string" ? poster.trim() : "";
    const trimmedDescription = typeof description === "string" ? description.trim() : "";

    if (!trimmedTitle || !trimmedPoster || !trimmedDescription) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // Filmi veritabanına ekliyoruz. Parametrik sorgu kullanımı SQL enjeksiyonuna karşı güvenlik sağlar.
    await db.query(
      "INSERT INTO movies (title, poster, description) VALUES (?, ?, ?)",
      [trimmedTitle, trimmedPoster, trimmedDescription]
    );

    return NextResponse.json(
      { message: "Film uploaded successfully." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error uploading movie:", error);
    return NextResponse.json(
      { message: error.message || "Error uploading movie." },
      { status: 500 }
    );
  }
}

/**
 * GET: Rastgele film getirir.
 * Tüm filmler veritabanından çekilir, rastgele bir film seçilir ve gerekli alanlar döndürülür.
 */
export async function GET() {
  try {
    // Tüm filmleri veritabanından çekiyoruz.
    const [rows] = await db.query("SELECT * FROM movies") as unknown as [RowDataPacket[], any];
    
    // Filmler yoksa 404 döndürüyoruz.
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { message: "No movies found." },
        { status: 404 }
      );
    }

    // Rastgele bir index belirleyip, o index'teki filmi seçiyoruz.
    const randomIndex = Math.floor(Math.random() * rows.length);
    const randomMovie = rows[randomIndex];

    // Gerekli alanları seçip yeni bir obje oluşturuyoruz.
    const movie = {
      title: randomMovie.title,
      poster: randomMovie.poster,
      description: randomMovie.description,
    };

    return NextResponse.json(movie, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching random movie:", error);
    return NextResponse.json(
      { message: error.message || "Error fetching movie." },
      { status: 500 }
    );
  }
}
