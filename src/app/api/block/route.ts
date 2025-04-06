// src/app/api/block/route.ts
//Bu dosya, kullanıcılar arası engelleme işlemlerini yöneten bir 
//API endpoint’idir (/api/block) ve üç HTTP metodunu destekler: 
//GET isteğiyle JWT doğrulaması yapılan kullanıcının engellediği 
//kullanıcılar listelenir, POST isteğiyle belirtilen blockedUserId 
//veritabanındaki blocks tablosuna eklenerek kullanıcı engellenir, 
//DELETE isteğiyle ise mevcut engel kaldırılır. Tüm işlemler için 
//JWT ile kimlik doğrulaması zorunludur ve her işlemde uygun 
//hata kontrolü, status kodları ve açıklayıcı yanıtlar sağlanır.
// src/app/api/block/route.ts
// Kullanıcılar arası engelleme işlemleri için HttpOnly cookie uyumlu endpoint
// src/app/api/block/route.ts
// src/app/api/block/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import jwt from "jsonwebtoken";

/**
 * GET    => Engellenen kullanıcıları listele  (/api/block)
 * POST   => Bir kullanıcıyı engelle          (/api/block)
 * DELETE => Engeli kaldır                    (/api/block)
 */

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Token değerini trim edip temizliyoruz
    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    // JWT decode => myId
    const decoded = jwt.verify(token, secret) as { id: number };
    const myId = decoded.id;

    // blocks tablosundan engellediğim kullanıcıları çekelim
    const query = `
      SELECT u.id, u.username, u.profile_image
      FROM blocks b
      JOIN users u ON u.id = b.blocked_id
      WHERE b.blocker_id = ?
    `;
    const [rows] = await db.query<RowDataPacket[]>(query, [myId]);

    return NextResponse.json({ blocked: rows }, { status: 200 });
  } catch (err: unknown) {
    console.error("GET /api/block error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const myId = decoded.id;

    const body = await request.json();
    // Giriş parametresi tip kontrolü: blockedUserId'in tanımlı olduğundan emin oluyoruz.
    const { blockedUserId } = body;
    if (!blockedUserId) {
      return NextResponse.json({ message: "blockedUserId required" }, { status: 400 });
    }
    // (Opsiyonel) blockedUserId'in bir sayı olduğundan emin olunabilir:
    // if (isNaN(Number(blockedUserId))) { return NextResponse.json({ message: "blockedUserId must be a number" }, { status: 400 }); }

    // blocks tablosuna ekle
    const insertQuery = `
      INSERT INTO blocks (blocker_id, blocked_id)
      VALUES (?, ?)
    `;
    await db.query(insertQuery, [myId, blockedUserId]);

    return NextResponse.json({ message: "User blocked" }, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/block error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const myId = decoded.id;

    const body = await request.json();
    const { blockedUserId } = body;
    if (!blockedUserId) {
      return NextResponse.json({ message: "blockedUserId required" }, { status: 400 });
    }
    // (Opsiyonel) blockedUserId'in sayı olup olmadığını kontrol edebilirsiniz.

    // blocks tablosundan sil
    const delQuery = `
      DELETE FROM blocks
      WHERE blocker_id = ?
        AND blocked_id = ?
    `;
    await db.query(delQuery, [myId, blockedUserId]);

    return NextResponse.json({ message: "Block removed" }, { status: 200 });
  } catch (err: unknown) {
    console.error("DELETE /api/block error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
