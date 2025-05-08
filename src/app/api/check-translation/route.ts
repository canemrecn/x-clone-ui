// src/app/api/check-translation/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/utils/getAuthUser";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2"; // ✅ EKLENDİ

export async function GET(req: NextRequest) {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const word = searchParams.get("word");

    if (!postId || !word) {
        return NextResponse.json({ error: "postId ve word gereklidir" }, { status: 400 });
    }

    const [rows] = await db.query<RowDataPacket[]>(
        "SELECT id FROM user_translations WHERE user_id = ? AND post_id = ? AND word = ?",
        [authUser.id, postId, word]
    );

    const alreadyTranslated = rows.length > 0;

    return NextResponse.json({ alreadyTranslated });
}

export async function POST(req: NextRequest) {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId, word } = await req.json();

    if (!postId || !word) {
        return NextResponse.json({ error: "postId ve word gereklidir" }, { status: 400 });
    }

    try {
        // ✅ Kelimeyi kaydet
        await db.query(
            "INSERT IGNORE INTO user_translations (user_id, post_id, word) VALUES (?, ?, ?)",
            [authUser.id, postId, word]
        );

        // ✅ Kullanıcının puanını artır
        await db.query("UPDATE users SET points = points + 1 WHERE id = ?", [authUser.id]);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
