// src/lib/imagekit.ts
// src/lib/imagekit.ts
import ImageKit from "imagekit";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Ortam değişkenlerini al
const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

// Sadece production'da eksikse hata ver
if (
  process.env.NODE_ENV === "production" &&
  (!publicKey || !privateKey || !urlEndpoint)
) {
  throw new Error("❌ ImageKit ortam değişkenleri eksik! .env dosyanı kontrol et.");
}

const imagekit = new ImageKit({
  publicKey: publicKey || "",
  privateKey: privateKey || "",
  urlEndpoint: urlEndpoint || "",
});

// Belirli bir kullanıcıya ait medya dosyalarını ImageKit'ten siler
export async function deleteUserMediaFromImageKit(userId: number) {
  try {
    const [results] = await db.query<RowDataPacket[]>(
      `SELECT media_url FROM posts WHERE user_id = ? AND media_url IS NOT NULL`,
      [userId]
    );

    const urls: string[] = results.map((row) => row.media_url);

    for (const url of urls) {
      const fileId = extractFileId(url);
      if (fileId) {
        await imagekit.deleteFile(fileId);
      }
    }
  } catch (error) {
    console.error("❌ ImageKit medya silme hatası:", error);
  }
}

// URL içinden dosya ID'sini çeker
function extractFileId(url: string): string | null {
  const match = url.match(/\/([^\/]+)$/);
  return match ? match[1] : null;
}
