import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

// Yeni Seviye Sistemi
export function getLevelByPoints(points: number): string {
  if (points < 10000) return "Beginner";
  if (points < 30000) return "Novice";
  if (points < 50000) return "Intermediate";
  if (points < 70000) return "Advanced";
  if (points < 1000000) return "Master";
  return "Legend";
}

// Kullanıcıya puan ekleme fonksiyonu
export async function updateUserPoints(userId: number, pointChange: number) {
  console.log(`📌 updateUserPoints çağrıldı: userId=${userId}, pointChange=${pointChange}`);

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT points FROM users WHERE id = ?",
      [userId]
    );

    if (!rows?.length) {
      console.error(`❌ Kullanıcı bulunamadı: userId=${userId}`);
      return;
    }

    const currentPoints = rows[0].points ?? 0;
    const newPoints = Math.max(0, currentPoints + pointChange); // Negatif puan olamaz
    const newLevel = getLevelByPoints(newPoints);

    await db.query(
      "UPDATE users SET points = ?, level = ? WHERE id = ?",
      [newPoints, newLevel, userId]
    );

    console.log(`✅ Kullanıcının yeni puanı: ${newPoints}, Yeni seviye: ${newLevel}`);
  } catch (error) {
    console.error("Puan güncelleme hatası:", error);
  }
}
