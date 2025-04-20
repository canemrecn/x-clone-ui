// src/lib/imagekit.ts
import ImageKit from "imagekit";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function deleteUserMediaFromImageKit(userId: number) {
  try {
    const [results] = await db.query(
      `SELECT media_url FROM posts WHERE user_id = ? AND media_url IS NOT NULL`,
      [userId]
    );

    const urls: string[] = (results as RowDataPacket[]).map(row => row.media_url);

    for (const url of urls) {
      const fileId = extractFileId(url);
      if (fileId) {
        await imagekit.deleteFile(fileId);
      }
    }
  } catch (error) {
    console.error("ImageKit medya silme hatası:", error);
  }
}

// ✅ DÜZGÜN REGEX: son segmenti dosya ID'si olarak alır
function extractFileId(url: string): string | null {
  const match = url.match(/\/([^\/]+)$/);
  return match ? match[1] : null;
}
