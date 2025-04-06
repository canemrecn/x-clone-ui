// src/lib/cron-cleaner.ts
import cron from "node-cron";
import { db } from "../lib/db";

// 2 yıl sonra silinmesi gereken verileri temizle
const cleanupOldArchivedData = async () => {
  try {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    // Silinen Gönderiler Tablosundan 2 yıl önceki verileri temizle
    await db.query(`
      DELETE FROM deleted_posts
      WHERE deleted_at < ?
    `, [twoYearsAgo]);

    // Silinen Yorumlar Tablosundan 2 yıl önceki verileri temizle
    await db.query(`
      DELETE FROM deleted_comments
      WHERE deleted_at < ?
    `, [twoYearsAgo]);

    // Silinen Kullanıcılar Tablosundan 2 yıl önceki verileri temizle
    await db.query(`
      DELETE FROM deleted_users
      WHERE deleted_at < ?
    `, [twoYearsAgo]);

    console.log("Eski veriler başarıyla silindi.");
  } catch (error) {
    console.error("Temizlik hatası:", error);
  }
};

// Günlük olarak çalışacak cron job
cron.schedule("0 0 * * *", () => {
  console.log("Veri temizleme işlemi başlatılıyor...");
  cleanupOldArchivedData();
});
