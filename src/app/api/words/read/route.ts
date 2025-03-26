// src/app/api/words/read/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { word } = await req.json();
    if (!word) {
      return NextResponse.json({ message: "No word provided" }, { status: 400 });
    }

    // Auth
    const authHeader = req.headers.get("authorization");
    // ...
    // user_id bul

    // puan ekle: 0.1
    // vs. ...
    return NextResponse.json({ message: "Kelime okundu, +0.1 puan" });
  } catch (error) {
    return NextResponse.json({ message: "Error", error: String(error) }, { status: 500 });
  }
}
