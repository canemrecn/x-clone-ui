import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { IncomingForm, File } from "formidable";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Form-data desteği için bodyParser'ı kapattık
  },
};

// Async olarak form verilerini ayrıştırmak için Promise tabanlı parseForm fonksiyonu
const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), "public/uploads"),
      keepExtensions: true,
      multiples: false,
    });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Form verilerini ayrıştır
    const { fields, files } = await parseForm(req);

    // Dosyanın varlığını kontrol et
    if (!files.file) {
      return res.status(400).json({ message: "Dosya yüklenemedi, geçersiz dosya." });
    }

    // Eğer dosya array ise ilk öğeyi, değilse dosyayı al
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    // Yeni dosya yolunu oluştur (public klasörü içinde)
    const newPath = `/uploads/${file.newFilename}`;

    return res.status(201).json({ fileUrl: newPath });
  } catch (error) {
    console.error("Dosya yükleme hatası:", error);
    return res.status(500).json({ message: "Dosya yüklenirken hata oluştu." });
  }
}
