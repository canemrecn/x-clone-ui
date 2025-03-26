// src/app/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Token'ı temizlemek için cookie'yi geçersiz kıl
  res.setHeader("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure");
  
  res.status(200).json({ message: "Logged out" });
}
