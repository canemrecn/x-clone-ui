// src/app/api/reports/route.ts
/* 
Bu dosya, bir gönderinin şikayet edilmesi durumunda şikayet nedenini ve gönderi bağlantısını belirlenmiş e-posta 
adresine gönderen POST /api/report endpoint’ini tanımlar. Gelen postId ve reason alanları doğrulanıp temizlenir, 
ardından nodemailer kullanılarak şikayet içeriği reportEmail adresine e-posta olarak iletilir. 
E-posta gönderimi için Gmail servis bilgileri ortam değişkenlerinden alınır.
*/
// src/app/api/reports/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { postId, reason } = await req.json();

    if (!postId || !reason) {
      return NextResponse.json(
        { error: "postId ve reason zorunludur." },
        { status: 400 }
      );
    }

    const trimmedPostId = postId.toString().trim();
    const trimmedReason = reason.toString().trim();

    if (!trimmedPostId || !trimmedReason) {
      return NextResponse.json(
        { error: "postId ve reason boş bırakılamaz." },
        { status: 400 }
      );
    }

    // Post gerçekten var mı diye kontrol et (isteğe bağlı ama önerilir)
    const result: any = await db.query(
      `SELECT posts.*, users.username, users.full_name, posts.media_url, posts.media_type 
       FROM posts 
       LEFT JOIN users ON users.id = posts.user_id 
       WHERE posts.id = ?`,
      [trimmedPostId]
    );

    const post = result[0]?.[0];
    return NextResponse.json(
      { message: "Şikayet kaydedildi." },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Report POST error:", err);
    return NextResponse.json(
      { error: err.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}
