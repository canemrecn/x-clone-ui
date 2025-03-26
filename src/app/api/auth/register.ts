import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import crypto from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") 
    return res.status(405).json({ message: "Method Not Allowed" });

  // Güvenlik sorusu ve cevabı alanlarını da ekliyoruz.
  const { full_name, username, email, password, securityQuestion, securityAnswer } = req.body;
  if (!full_name || !username || !email || !password || !securityQuestion || !securityAnswer) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Şifre ve güvenlik cevabını hash'liyoruz.
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer, 10);
    const verificationCode = crypto.randomBytes(20).toString("hex");

    const [result] = await db.query(
      `
      INSERT INTO users (full_name, username, email, password, verification_code, security_question, security_answer)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [full_name, username, email, hashedPassword, verificationCode, securityQuestion, hashedSecurityAnswer]
    );

    res.status(201).json({ message: "User registered. Please verify your email." });
  } catch (error) {
    res.status(500).json({ message: "Database error", error });
  }
}
