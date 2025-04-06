//src/pages/api/upload.ts
/*Bu dosya, multipart/form-data formatındaki dosya yüklemelerini işleyen bir Next.js API endpoint’idir. 
formidable kütüphanesini kullanarak gelen POST isteğinden form verilerini ve dosyayı ayrıştırır, dosyayı 
sunucunun public/uploads klasörüne kaydeder ve başarılıysa yüklü dosyanın yolunu (/uploads/filename) içeren 
bir JSON yanıtı döner. Yanlış yöntem ya da hata durumlarında uygun hata mesajları ile yanıt verir.*/
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { IncomingForm, File } from "formidable";
import path from "path";
import { getAuthUser } from "@/utils/getAuthUser";

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser for form-data support
  },
};

// Async function to parse form data
const parseForm = (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
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
    return res.status(405).json({ message: "Only POST method allowed" });
  }

  try {
    // Get the authenticated user from the HTTP-only cookie
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Parse the form data
    const { fields, files } = await parseForm(req);

    // Check if a file exists
    if (!files.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // If there are multiple files, pick the first one
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const filePath = `/uploads/${file.newFilename}`;

    return res.status(201).json({ fileUrl: filePath });
  } catch (error) {
    console.error("❌ File upload error:", error);
    return res.status(500).json({ message: "Server error during file upload." });
  }
}
