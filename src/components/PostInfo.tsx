// src/components/PostInfo.tsx
import Image from "./image";

export default function PostInfo() {
  return (
    <div className="cursor-pointer w-4 h-4 relative hover:scale-110 transition">
      <Image
        path="icons/infoMore.svg"
        alt="Post Info"
        w={16}
        h={16}
        className="filter invert-[35%] brightness-90 hue-rotate-180"
      />
    </div>
  );
}
