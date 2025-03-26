// src/app/@modal/compose/post/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PostModal = () => {
  const router = useRouter();
  const auth = useAuth();

  const closeModal = () => {
    router.back();
  };

  return (
    <div className="absolute w-screen h-screen top-0 left-0 z-20 bg-[#bcd2ee]/60 backdrop-blur-lg flex justify-center items-center">
      <div className="py-6 px-8 rounded-xl bg-[#a2b5cd] w-[600px] h-max shadow-lg border border-[#BDC4BF]">
        {/* TOP - Üst Kısım */}
        <div className="flex items-center justify-between border-b border-[#BDC4BF] pb-4">
          <button 
            className="text-black font-semibold text-lg cursor-pointer hover:text-black transition-all"
            onClick={closeModal}
          >
            ✖
          </button>
          <div className="text-black font-bold text-lg">Drafts</div>
        </div>

        {/* CENTER - İçerik Alanı */}
        <div className="py-6 flex gap-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#BDC4BF]"></div>
          <input
            className="flex-1 bg-transparent outline-none text-lg text-black placeholder-[#BDC4BF]"
            type="text"
            placeholder={
              auth?.user
                ? `What's happening, ${auth.user.full_name}?`
                : "What is happening?"
            }
          />
        </div>

        {/* BOTTOM - Alt Kısım */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-t border-[#BDC4BF] pt-4">
          <div className="flex gap-4 flex-wrap">
            {/* Buraya simgeler eklenebilir */}
          </div>
          <button className="py-2 px-5 text-black bg-[#bcd2ee] rounded-full font-bold hover:bg-[#3E6A8A] transition-all">
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
