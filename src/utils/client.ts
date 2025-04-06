// src/utils/client.ts
/*Bu dosya, istemci tarafında (tarayıcıda) kullanılmak üzere imagekit-javascript kütüphanesiyle bir ImageKit 
istemcisi (clientImageKit) oluşturur; bu istemci, güvenlik gereği private key içermeden yalnızca publicKey 
ve urlEndpoint ile yapılandırılır ve medya dosyalarının ImageKit üzerinden kolayca erişilip yönetilmesini sağlar.*/
// src/utils/client.ts
import ImageKit from "imagekit-javascript";

// İstemci tarafında kullanılan ImageKit instance'ı (privateKey olmadan)
// Bu instance yalnızca bir kez oluşturulacağından performans açısından ek optimizasyona gerek yoktur.
export const clientImageKit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});
