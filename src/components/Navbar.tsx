"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const languages = [
    { code: "en", image: "/icons/united-kingdom.png" },
    { code: "de", image: "/icons/german-flag.png" },
    { code: "it", image: "/icons/italian.png" },
    { code: "es", image: "/icons/spain.png" },
    { code: "ru", image: "/icons/russia.png" },
  ];

  return (
    <nav
      className="
        fixed
        top-0
        left-0
        w-full
        z-50
        bg-[#3E6A8A]
        px-4
        py-2
        shadow-md
      "
    >
      <ul className="flex justify-center gap-6">
        {languages.map((lang) => (
          <li key={lang.code}>
            <Link href={`/${lang.code}`}>
              <Image src={lang.image} alt={lang.code} width={24} height={24} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
