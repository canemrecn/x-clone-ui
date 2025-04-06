// src/app/api/admin/deleted-users/export/route.ts
// src/app/api/admin/deleted-users/export/route.ts

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { RowDataPacket } from "mysql2";
import PDFDocument from "pdfkit";
import { Parser } from "json2csv";
import fs from "fs";
import path from "path";
import { PassThrough } from "stream";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number; role: string };
    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized - Admin Only" }, { status: 401 });
    }

    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "pdf";

    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        d.user_id AS id,
        u.full_name,
        u.username,
        d.email,
        d.reason,
        d.deleted_at
      FROM deletion_logs d
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.deleted_at DESC
    `);

    // ✅ CSV formatı
    if (format === "csv") {
      const parser = new Parser();
      const csv = parser.parse(rows);
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=silinen-hesaplar.csv",
        },
      });
    }

    // ✅ PDF formatı
    if (format === "pdf") {
      const fontPath = path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf");

      if (!fs.existsSync(fontPath)) {
        return NextResponse.json({
          message: "Font file not found: public/fonts/Roboto-Regular.ttf",
        }, { status: 500 });
      }

      const buffers: Buffer[] = []; // ✅ Eksik olan bu satır!
      const doc = new PDFDocument({ font: fontPath });

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => null);

      doc.fontSize(20).text("Silinen Hesaplar", { align: "center" }).moveDown();

      rows.forEach((user, index) => {
        doc.fontSize(12).text(`${index + 1}. ${user.full_name || "-"} (@${user.username || "-"})`);
        doc.text(`E-posta: ${user.email || "-"}`);
        doc.text(`Sebep: ${user.reason || "Belirtilmemiş"}`);
        doc.text(`Tarih: ${new Date(user.deleted_at).toLocaleString()}`);
        doc.moveDown();
      });

      doc.end();

      const pdfBuffer = await new Promise<Buffer>((resolve) => {
        doc.on("end", () => resolve(Buffer.concat(buffers)));
      });

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=silinen-hesaplar.pdf",
        },
      });
    }

    return NextResponse.json({ message: "Unsupported format" }, { status: 400 });
  } catch (err: any) {
    console.error("Export error:", err);
    return NextResponse.json({ message: "Sunucu hatası", error: err.message }, { status: 500 });
  }
}
