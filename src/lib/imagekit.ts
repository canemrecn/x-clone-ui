// src/lib/imagekit.ts
import ImageKit from "imagekit";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

/**
 * ImageKit örneği oluşturur. Ortam değişkenleri eksikse hata fırlatır.
 */
export function getImageKitInstance(): ImageKit {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error("❌ ImageKit ortam değişkenleri eksik! .env dosyanı kontrol et.");
  }

  return new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
}

/**
 * Belirli bir kullanıcıya ait tüm medya dosyalarını ImageKit üzerinden siler.
 */
export async function deleteUserMediaFromImageKit(userId: number) {
  try {
    const imagekit = getImageKitInstance();

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

/**
 * URL içinden dosya ID'sini çeker
 */
function extractFileId(url: string): string | null {
  const match = url.match(/\/([^\/?#]+)(?:\?|#|$)/);
  return match ? match[1] : null;
}
