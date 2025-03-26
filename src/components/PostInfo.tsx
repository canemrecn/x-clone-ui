"use client";

import React from "react";
import Image from "next/image";

const PostInfo = React.memo(function PostInfo() {
  return (
    <div className="cursor-pointer w-10 h-10 relative bg-gradient-to-br from-gray-800 to-gray-800 rounded-full shadow-md hover:scale-110 transition">
      <Image
        src="https://ik.imagekit.io/n6qnlu3rx/tr:q-20,bl-6/icons/infoMore.svg"
        alt="Info More"
        width={50} // İhtiyacınıza göre ayarlayın
        height={50} // İhtiyacınıza göre ayarlayın
      />
    </div>
  );
});

export default PostInfo;
