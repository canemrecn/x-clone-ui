import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// POST: Yeni film yükler
export async function POST(request: Request) {
  try {
    const { title, poster, description } = await request.json();
    if (!title || !poster || !description) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    await db.query(
      "INSERT INTO movies (title, poster, description) VALUES (?, ?, ?)",
      [title, poster, description]
    );

    return NextResponse.json({ message: "Film uploaded successfully." }, { status: 201 });
  } catch (error: any) {
    console.error("Error uploading movie:", error);
    return NextResponse.json({ message: error.message || "Error uploading movie." }, { status: 500 });
  }
}

// GET: Rastgele film getirir
export async function GET() {
  try {
    // Sorgu sonucunu unknown olarak alıp, tipini dönüştürüyoruz.
    const [rows] = await db.query("SELECT * FROM movies") as unknown as [RowDataPacket[], any];
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ message: "No movies found." }, { status: 404 });
    }

    const randomIndex = Math.floor(Math.random() * rows.length);
    const randomMovie = rows[randomIndex];

    const movie = {
      title: randomMovie.title,
      poster: randomMovie.poster,
      description: randomMovie.description,
    };

    return NextResponse.json(movie, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching random movie:", error);
    return NextResponse.json({ message: error.message || "Error fetching movie." }, { status: 500 });
  }
}
