// utils/blockHelpers.ts
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

/**
 * İki kullanıcı arasında blok ilişkisi olup olmadığını kontrol eder.
 * @param user1 - İlk kullanıcının ID'si
 * @param user2 - İkinci kullanıcının ID'si
 * @returns {Promise<boolean>} Eğer blok ilişkisi varsa true, yoksa false döner.
 */
export async function areUsersBlocked(user1: number, user2: number): Promise<boolean> {
  const query = `
    SELECT id FROM blocks
    WHERE (blocker_id = ? AND blocked_id = ?)
       OR (blocker_id = ? AND blocked_id = ?)
  `;
  const [rows] = await db.query<RowDataPacket[]>(query, [user1, user2, user2, user1]);
  return rows.length > 0;
}
