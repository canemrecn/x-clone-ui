//src/components/PostInfo.tsx
/*Bu dosya, PostInfo adında görsel olarak bir bilgi simgesi (infoMore.svg) gösteren küçük, yuvarlak ve tıklanabilir bir bileşen tanımlar; 
genellikle bir gönderiyle ilgili daha fazla bilgi veya seçenek sunmak için kullanılır. Görselin üzerine gelindiğinde hafif büyür (hover efekti) 
ve bileşen performans optimizasyonu için React.memo ile sarmalanmıştır.*/
// src/components/PostInfo.tsx
/*Bu dosya, PostInfo adında görsel olarak bir bilgi simgesi (infoMore.svg) gösteren küçük, yuvarlak ve tıklanabilir bir bileşen tanımlar; 
genellikle bir gönderiyle ilgili daha fazla bilgi veya seçenek sunmak için kullanılır. Görselin üzerine gelindiğinde hafif büyür (hover efekti) 
ve bileşen performans optimizasyonu için React.memo ile sarmalanmıştır.*/
"use client";

import React from "react";
import Image from "next/image";

const PostInfo = React.memo(function PostInfo() {
  return (
    <div className="cursor-pointer w-10 h-10 relative bg-gradient-to-br from-gray-800 to-gray-800 rounded-full shadow-md hover:scale-110 transition">
      <Image
        src="https://ik.imagekit.io/n6qnlu3rx/tr:q-20,bl-6/icons/infoMore.svg"
        alt="Info More"
        width={50}
        height={50}
      />
    </div>
  );
});

export default PostInfo;