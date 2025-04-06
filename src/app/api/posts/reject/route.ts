// src/app/api/posts/reject/route.ts
// Bu dosya, admin tarafından AI filtresine takılan bekleyen gönderinin silinmesini sağlar.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number; role: string };
    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Admin access only" }, { status: 403 });
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ message: "Missing post ID" }, { status: 400 });
    }

    await db.query("DELETE FROM pending_posts WHERE id = ?", [postId]);

    return NextResponse.json({ message: "Post rejected and deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("Reject post error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
