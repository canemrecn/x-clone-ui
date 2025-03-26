//src/app/api/users/cover-image/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { serverImageKit } from "@/utils/server";

export async function POST(req: Request) {
  try {
    const { token, cover_image } = await req.json();
    if (!token || !cover_image) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    const uploadResponse = await serverImageKit.upload({
      file: cover_image,
      fileName: `cover_${userId}_${Date.now()}.jpg`,
      folder: "/users/cover_images",
    });
    const imageUrl = uploadResponse.url;

    await db.query("UPDATE users SET cover_image = ? WHERE id = ?", [
      imageUrl,
      userId,
    ]);

    return NextResponse.json({ message: "Cover image updated", imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Cover image error:", error);
    return NextResponse.json({ message: "Server error", error: String(error) }, { status: 500 });
  }
}
