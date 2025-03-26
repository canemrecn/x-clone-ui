//src/app/api/users/profile-image/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { serverImageKit } from "@/utils/server";

export async function POST(req: Request) {
  try {
    const { token, profile_image } = await req.json();
    if (!token || !profile_image) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // ImageKit'e yükleme: profile_image base64 string formatında gelmelidir.
    const uploadResponse = await serverImageKit.upload({
      file: profile_image, // Base64 string veya binary veri
      fileName: `profile_${userId}_${Date.now()}.jpg`,
      folder: "/users/profile_images",
    });
    const imageUrl = uploadResponse.url;

    await db.query("UPDATE users SET profile_image = ? WHERE id = ?", [
      imageUrl,
      userId,
    ]);

    return NextResponse.json({ message: "Profile image updated", imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Profile image error:", error);
    return NextResponse.json({ message: "Server error", error: String(error) }, { status: 500 });
  }
}

