//src/utils/servert.ts
import ImageKit from "imagekit";

// Gerekli ortam değişkenlerinin varlığını kontrol ediyoruz.
if (
  !process.env.IMAGEKIT_PUBLIC_KEY ||
  !process.env.IMAGEKIT_PRIVATE_KEY ||
  !process.env.IMAGEKIT_URL_ENDPOINT
) {
  throw new Error("Missing required ImageKit environment variables");
}

// ImageKit instance'ı, sunucu tarafında kullanılmak üzere yapılandırılıyor.
export const serverImageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});
