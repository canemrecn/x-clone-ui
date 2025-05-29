// src/app/api/account/data/export/route.ts
// src/app/api/account/data/export/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

export async function GET(req: Request) {
  try {
    const cookieStore =await cookies(); // await kaldırıldı, çünkü cookies() async değildir
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret) as { id: number };
    } catch (err) {
      return NextResponse.json({ message: "Geçersiz token" }, { status: 403 });
    }

    const userId = decoded.id;

    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "pdf"; // pdf | csv

    // 1. Verileri topla
    const [user] = await db.query<RowDataPacket[]>(
      "SELECT full_name, username, email, profile_image, created_at FROM users WHERE id = ?",
      [userId]
    );

    const [posts] = await db.query<RowDataPacket[]>(
      "SELECT id, title, content, created_at FROM posts WHERE user_id = ?",
      [userId]
    );

    // 2. PDF formatıysa
    if (format === "pdf") {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => null); // dummy listener

      doc.fontSize(18).text("Kullanıcı Verileri (UnderGo)", { align: "center" }).moveDown();

      doc.fontSize(12).text(`Ad Soyad: ${user[0]?.full_name ?? "-"}`);
      doc.text(`Kullanıcı Adı: @${user[0]?.username ?? "-"}`);
      doc.text(`E-posta: ${user[0]?.email ?? "-"}`);
      doc.text(`Oluşturulma Tarihi: ${new Date(user[0]?.created_at).toLocaleString("tr-TR")}`).moveDown();

      doc.fontSize(14).text("Paylaşılan Gönderiler:", { underline: true }).moveDown(0.5);

      if (posts.length === 0) {
        doc.fontSize(12).text("Gönderi bulunamadı.");
      } else {
        posts.forEach((post) => {
          doc.fontSize(12).text(`- ${post.title || "(Başlıksız)"} (${new Date(post.created_at).toLocaleString("tr-TR")})`);
          doc.fontSize(10).text(post.content || "").moveDown(0.5);
        });
      }

      doc.end();

      const pdfBuffer = await new Promise<Buffer>((resolve) => {
        const buffers: Buffer[] = [];
        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
      });

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=undergo-verilerim.pdf`,
        },
      });
    }

    // 3. CSV formatıysa
    else if (format === "csv") {
      if (!posts.length) {
        return new Response("Hiç gönderi bulunamadı.", {
          status: 200,
          headers: {
            "Content-Type": "text/plain",
          },
        });
      }

      const parser = new Parser();
      const csv = parser.parse(posts);

      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=undergo-gonderiler.csv`,
        },
      });
    }

    // 4. Geçersiz format
    return NextResponse.json({ message: "Geçersiz format" }, { status: 400 });

  } catch (err: any) {
    console.error("Export error:", err);
    return NextResponse.json(
      { message: "Sunucu hatası", error: err.message },
      { status: 500 }
    );
  }
}
