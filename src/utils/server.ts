//src/utils/server.ts
/*Bu dosya, sunucu tarafında kullanılmak üzere ImageKit kütüphanesinden bir serverImageKit örneği oluşturur; 
bu örnek, ortam değişkenleri (publicKey, privateKey, urlEndpoint) ile yapılandırılır ve eksik değişkenler 
varsa hata fırlatılarak yapılandırma güvence altına alınır.*/
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
