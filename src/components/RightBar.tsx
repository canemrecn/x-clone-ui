// src/components/RightBar.tsx
// src/components/RightBar.tsx
"use client";

import Search from "./Search";
import Arrangement from "./Arrangement";
import Link from "next/link";
import Notes from "./Notes";

export default function RightBar() {
  return (
    <div className="
    hidden
    lg:flex
    flex-col
    fixed
    top-13
    right-30
    w-74
    h-200
    shadow-md
    border-r
    border-[#BDC4BF]
    justify-between
    pt-7
    pb-1
    z-50
  ">
      <Search />
      <Arrangement />
      <Notes />
      <div className="text-[#3E6A8A] text-sm flex gap-x-4 flex-wrap border-t border-[#BDC4BF] pt-2 mt-2">
        <Link href="/" className="hover:text-[#A8DBF0] transition-all">
          Terms of Service
        </Link>
        <Link href="/" className="hover:text-[#A8DBF0] transition-all">
          Privacy Policy
        </Link>
        <Link href="/" className="hover:text-[#A8DBF0] transition-all">
          Cookie Policy
        </Link>
        <Link href="/" className="hover:text-[#A8DBF0] transition-all">
          Accessibility
        </Link>
        <span className="text-[#BDC4BF]">2025 Practical Language</span>
      </div>
    </div>
  );
}
