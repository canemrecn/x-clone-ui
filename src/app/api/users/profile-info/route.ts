// src/app/api/users/profile-info/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { token, profile_info } = await req.json();
    if (!token || !profile_info) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { id: number };

    await db.query("UPDATE users SET profile_info = ? WHERE id = ?", [
      profile_info,
      decoded.id,
    ]);

    return NextResponse.json({ message: "Profile info updated" }, { status: 200 });
  } catch (error) {
    console.error("Profile info error:", error);
    return NextResponse.json({ message: "Server error", error: String(error) }, { status: 500 });
  }
}
