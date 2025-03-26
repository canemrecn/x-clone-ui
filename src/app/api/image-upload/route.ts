import { NextResponse } from "next/server";
import ImageKit from "imagekit";

// ImageKit yapılandırması: Ortam değişkenlerinin eksik olmaması durumunda hata fırlatılır.
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: Request) {
  try {
    // Form verilerini alıyoruz
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Dosya içeriğini arrayBuffer olarak alıp Buffer'a dönüştürüyoruz.
    const buffer = await file.arrayBuffer();
    const uploadResult = await imagekit.upload({
      file: Buffer.from(buffer),
      fileName: file.name,
      folder: "/your-folder-name", // İsteğe bağlı: klasör adı belirtilebilir
    });

    // imagekit yükleme sonucunda URL döner. file.type, dosyanın türünü belirtir (örn: "video/mp4", "image/png").
    return NextResponse.json(
      { url: uploadResult.url, fileType: file.type },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { message: "Image upload failed", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
