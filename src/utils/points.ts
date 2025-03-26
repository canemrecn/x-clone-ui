import { db } from "@/lib/db";
import { getLevelByPoints } from "./level";
import { RowDataPacket } from "mysql2/promise";

export async function updateUserPoints(userId: number, pointsToAdd: number) {
  // Kullanıcının mevcut puanını al
  const [user] = await db.query<RowDataPacket[]>(
    "SELECT points FROM users WHERE id = ?",
    [userId]
  );

  if (!user || user.length === 0) {
    throw new Error("User not found");
  }

  const currentPoints = user[0].points;
  const newPoints = currentPoints + pointsToAdd;

  // `level` sütunu artık olmadığı için sadece `points` güncellenecek
  await db.query(
    "UPDATE users SET points = ? WHERE id = ?",
    [newPoints, userId]
  );

  return newPoints;
}
