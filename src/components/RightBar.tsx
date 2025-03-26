"use client";

import React from "react";
import Arrangement from "@/components/Arrangement";
import Notes from "@/components/Notes";
import AdPlaceholder from "./AdPlaceholder"; // Reklam bileşeni

export default function RightBar() {
  return (
    <div className="
    hidden 
    lg:flex 
    flex-col 
    fixed 
    top-14 
    right-0 
    w-94 
    justify-between 
    pt-1
    pb-1
    z-50">
      <Arrangement />
      <Notes />
      {/* En altta reklam bileşeni */}
      <AdPlaceholder />
      <div className="text-gray-300 text-sm flex gap-x-4 flex-wrap border-t border-gray-300 pt-2 mt-2 px-2">
        <span className="hover:text-orange-400 cursor-pointer">Terms of Service</span>
        <span className="hover:text-orange-400 cursor-pointer">Privacy Policy</span>
        <span className="hover:text-orange-400 cursor-pointer">Cookie Policy</span>
        <span className="hover:text-orange-400 cursor-pointer">Accessibility</span>
        <span className="text-gray-500">2025 Undergo</span>
      </div>
    </div>
  );
}
