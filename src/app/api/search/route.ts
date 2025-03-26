// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const [rows] = await db.query(
      "SELECT id, username, full_name FROM users WHERE username LIKE ? OR full_name LIKE ? LIMIT 10",
      [`%${query}%`, `%${query}%`]
    );
    return NextResponse.json({ results: rows }, { status: 200 });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
