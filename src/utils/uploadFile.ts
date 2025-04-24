// src/utils/uploadFile.ts
import * as tf from "@tensorflow/tfjs";
import * as nsfwjs from "nsfwjs";
import { getImageKitInstance } from "@/lib/imagekit";

export async function uploadFileWithNSFWCheck(file: File): Promise<{ url: string; fileType: string }> {
  const buffer = await file.arrayBuffer();
  const image = new Image();
  const blob = new Blob([buffer]);
  const url = URL.createObjectURL(blob);
  image.src = url;

  const model = await nsfwjs.load();
  await new Promise((res) => (image.onload = res));

  const predictions = await model.classify(image);
  const hasNSFW = predictions.some((p) =>
    ["Porn", "Hentai", "Sexy"].includes(p.className) && p.probability > 0.7
  );

  if (hasNSFW) {
    throw new Error("Uygunsuz içerik tespit edildi. Admin onayı bekleniyor.");
  }

  const imagekit = getImageKitInstance();
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
