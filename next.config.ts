// /next.config.ts
/*Bu dosya, Next.js uygulamasının yapılandırmasını tanımlar; ik.imagekit.io alan adından resim yüklemelerine izin 
verir, sunucu tarafı işlemler için gövde boyut limitini 50 MB olarak ayarlar, ve ortam değişkenleri 
(ImageKit public/private key ve endpoint) tanımlayarak hem istemci hem de sunucu tarafında erişilebilir hale getirir.*/
/** /** @type {import('next').NextConfig} */
import "./src/app/start-cron"; // Cron job başlatılıyor
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io", // ImageKit üzerinden resim yüklemelerine izin ver
        port: "",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb", // 50 MB'a kadar dosya yüklemeye izin ver
    },
  },
  env: {
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY, // İstemci tarafı için public key
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT, // İstemci tarafı için URL endpoint
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY, // Sunucu tarafı için private key
  },
};

module.exports = nextConfig;
