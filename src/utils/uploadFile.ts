// src/utils/uploadFile.ts
import * as tf from "@tensorflow/tfjs";
import * as nsfwjs from "nsfwjs";
import ImageKit from "imagekit";

// ImageKit entegrasyonu
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function uploadFileWithNSFWCheck(file: File): Promise<{ url: string; fileType: string }> {
  // 1. Dosyayı base64 olarak oku
  const buffer = await file.arrayBuffer();
  const image = new Image();
  const blob = new Blob([buffer]);
  const url = URL.createObjectURL(blob);
  image.src = url;

  // 2. TensorFlow ile görseli analiz et
  const model = await nsfwjs.load(); // ✅ new yok
  await new Promise((res) => (image.onload = res));
  const predictions = await model.classify(image);

  const hasNSFW = predictions.some((p) =>
    ["Porn", "Hentai", "Sexy"].includes(p.className) && p.probability > 0.7
  );

  if (hasNSFW) {
    throw new Error("Uygunsuz içerik tespit edildi. Admin onayı bekleniyor.");
  }

  // 3. NSFW değilse ImageKit'e yükle
  const uploadResult = await imagekit.upload({
    file: Buffer.from(buffer),
    fileName: file.name,
    folder: "/uploads",
  });

  return {
    url: uploadResult.url,
    fileType: file.type,
  };
}
