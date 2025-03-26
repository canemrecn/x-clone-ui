//src/app/api/notes/[nodeId]/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket, OkPacket } from "mysql2/promise";

interface Context {
  params: { noteId: string };
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const { noteId } = params;
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 400 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not defined in .env");
    }
    const decoded = jwt.verify(token, secret) as { id: number };
    const userId = decoded.id;

    // Bu not gerçekten bu kullanıcıya mı ait?
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT user_id FROM notes WHERE id = ?",
      [noteId]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }
    if (rows[0].user_id !== userId) {
      return NextResponse.json({ message: "Not your note" }, { status: 403 });
    }

    // Notu sil
    await db.query<OkPacket>("DELETE FROM notes WHERE id = ?", [noteId]);

    return NextResponse.json({ message: "Note deleted" }, { status: 200 });
  } catch (error) {
    console.error("Note DELETE error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
