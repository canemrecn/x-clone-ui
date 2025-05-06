//src/pages/api/link-preview.ts
/*Bu dosya, bir bağlantı önizlemesi (link preview) için kullanılan POST metodunu kabul eden bir API endpoint’idir. 
Gelen istekteki url değerine göre işlem yapması öngörülmüş olsa da, şimdilik sabit olarak /icons/logom2.png resmini 
döndürmektedir. Eğer istek POST değilse, sadece POST yöntemine izin verildiğini belirten bir hata mesajı ve 405 
Method Not Allowed yanıtı döner.*/
// src/pages/api/link-preview.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthUser } from "@/utils/getAuthUser";

type Data = {
  image?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // HttpOnly cookie içindeki JWT'den kullanıcıyı al
    // Get the authenticated user
    const user = await getAuthUser();


    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { url } = req.body;

    // url yoksa hata döndür
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Geçerli bir URL belirtilmedi." });
    }

    // Gelecekte URL'ye göre gerçek preview işlemi buraya gelecek
    return res.status(200).json({
      image: "/icons/logo22.png",
    });
  } catch (err) {
    console.error("link-preview error:", err);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
}
