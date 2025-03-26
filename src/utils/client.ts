//src/utils/client.ts
// client.ts
import ImageKit from "imagekit-javascript";

// İstemci tarafında kullanılan ImageKit instance (privateKey olmadan!)
export const clientImageKit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});
