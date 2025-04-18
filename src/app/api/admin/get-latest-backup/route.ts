// src/app/api/admin/get-latest-backup/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // 📁 Yedek klasör yolu (Windows Desktop > yedekler)
    const backupDir = path.join(process.env.HOME || process.env.USERPROFILE || "", "Desktop", "yedekler");

    // 📂 .sql dosyalarını filtrele
    const files = fs.readdirSync(backupDir).filter((file) => file.endsWith(".sql"));
    if (files.length === 0) {
      return NextResponse.json({ message: "Yedek bulunamadı." }, { status: 404 });
    }

    // 📄 En son oluşturulan yedeği bul
    const latestFile = files.map((file) => ({
      file,
      time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time)[0].file;

    const fullPath = path.join(backupDir, latestFile);
    const fileBuffer = fs.readFileSync(fullPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename=\"${latestFile}\"`,
        "Content-Type": "application/sql",
      },
    });
  } catch (err) {
    console.error("Yedek indirilemedi:", err);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
