import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

async function exportDMData() {
  const userId1 = 8;
  const userId2 = 14;
  const targetDate = "2025-04-19";

  const [rows] = await db.query(
    `SELECT senderId, receiverId, message, created_at
     FROM dm_messages
     WHERE (
       (senderId = ? AND receiverId = ?) OR
       (senderId = ? AND receiverId = ?)
     )
     AND DATE(created_at) = ?`,
    [userId1, userId2, userId2, userId1, targetDate]
  );

  const outputPath = path.join(__dirname, `dm_messages_${userId1}_${userId2}_${targetDate}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2));
  console.log(`✅ JSON dosyası oluşturuldu: ${outputPath}`);
}

exportDMData();
