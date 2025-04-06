//src/actions.tsx
/*Bu dosya, sunucu tarafında çalışan shareAction adlı bir fonksiyon tanımlar; bu fonksiyon, bir FormData içinden 
alınan dosyayı (file) alır, dönüştürme ayarlarına (original, wide, square) ve hassas içerik bilgisine göre 
ImageKit servisine yükler. Görsel türündeki dosyalara genişlik ve oran dönüşümü uygulayarak /posts klasörüne 
yüklerken, dosyaya ait özel meta verileri (örneğin "sensitive") de ekler ve yükleme işlemi sırasında oluşan 
hata veya sonucu konsola yazdırır.*/
"use server";

import { serverImageKit } from "./utils/server";

export const shareAction = async (
  formData: FormData,
  settings: { type: "original" | "wide" | "square"; sensitive: boolean }
) => {
  // 1. Form datasını oku
  const file = formData.get("file") as File;
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const transformation = `w-600, ${
    settings.type === "square"
      ? "ar-1-1"
      : settings.type === "wide"
      ? "ar-16-9"
      : ""
  }`;

  // 2. Sunucuya yükle
  serverImageKit.upload(
    {
      file: buffer,
      fileName: file.name,
      folder: "/posts",
      ...(file.type.includes("image") && {
        transformation: {
          pre: transformation,
        },
      }),
      customMetadata: {
        sensitive: settings.sensitive,
      },
    },
    function (error: any, result: any) {
      if (error) console.log(error);
      else console.log(result);
    }
  );
};
