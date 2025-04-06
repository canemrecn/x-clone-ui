// src/utils/points.ts
/*Bu dosya, updateUserPoints fonksiyonu aracılığıyla bir kullanıcının mevcut puanını veritabanından alır, 
belirtilen puanı ekleyerek güncellenmiş puanı hesaplar ve ardından bu yeni puanı veritabanına kaydeder; 
işlem sırasında yalnızca points sütunu güncellenir, kullanıcı seviyesi (level) bu sürümde dikkate alınmaz.*/
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function updateUserPoints(userId: number, pointsToAdd: number): Promise<number> {
  try {
    // Kullanıcının mevcut puanını al
    const [userRows] = await db.query<RowDataPacket[]>(
      "SELECT points FROM users WHERE id = ?",
      [userId]
    );

    if (!userRows || userRows.length === 0) {
      throw new Error("User not found");
    }

    const currentPoints = userRows[0].points ?? 0;
    const newPoints = currentPoints + pointsToAdd;

    // Sadece points güncelleniyor (level sütunu kullanılmıyor)
    await db.query("UPDATE users SET points = ? WHERE id = ?", [newPoints, userId]);

    return newPoints;
  } catch (error) {
    console.error("updateUserPoints error:", error);
    throw error;
  }
}
