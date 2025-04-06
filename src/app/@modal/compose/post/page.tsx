// src/app/@modal/compose/post/page.tsx
//Bu dosya, kullanıcıların gönderi oluşturması için açılan bir modal pencereyi tanımlar; @modal/compose/post yoluyla çalışır, 
//modal arka planına veya “Escape” tuşuna basıldığında kapanır (router.back ile), giriş yapılmışsa placeholder’da kullanıcının 
//adı görünür, tasarımı odaklanılabilir ve erişilebilir olacak şekilde optimize edilmiştir. İçerik girişi ve “Post” butonu içerir, 
//ancak gönderi işlemi henüz işlevsel değildir. Bu modal, kullanıcı deneyimini geliştirmek için sayfa yerine üstte açılır şekilde 
//tasarlanmıştır.
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useCallback, useRef } from "react";

const PostModal = () => {
  const router = useRouter();
  const auth = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  // closeModal fonksiyonu useCallback ile sarmalandı.
  const closeModal = useCallback(() => {
    router.back();
  }, [router]);

  // Modal dışına tıklanması veya "Escape" tuşuna basıldığında kapatılması
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeModal]);

  // Modal açıldığında otomatik odaklanma (erişilebilirlik iyileştirmesi)
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      className="absolute w-screen h-screen top-0 left-0 z-20 bg-[#000000]/60 backdrop-blur-lg flex justify-center items-center"
      onClick={closeModal}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="py-6 px-8 rounded-xl bg-[#7E7E7E] w-[600px] h-max shadow-lg border border-[#BDC4BF]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Kısım */}
        <div className="flex items-center justify-between border-b border-[#BDC4BF] pb-4">
          <button
            className="font-semibold text-lg cursor-pointer hover:text-[#0F0F0F] transition-all text-[#D3DADF]"
            onClick={closeModal}
            aria-label="Close modal"
          >
            ✖
          </button>
          <div className="font-bold text-lg text-[#D3DADF]">Drafts</div>
        </div>

        {/* İçerik Alanı */}
        <div className="py-6 flex gap-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#7E7E7E]"></div>
          <input
            className="flex-1 bg-transparent outline-none text-lg text-[#D3DADF] placeholder-[#D3DADF]"
            type="text"
            placeholder={
              auth?.user
                ? `What's happening, ${auth.user.full_name}?`
                : "What is happening?"
            }
          />
        </div>

        {/* Alt Kısım */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-t border-[#BDC4BF] pt-4">
          <div className="flex gap-4 flex-wrap">
            {/* Buraya simgeler eklenebilir */}
          </div>
          <button className="py-2 px-5 text-[#D3DADF] bg-[#000000] rounded-full font-bold hover:bg-[#0F0F0F] transition-all">
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
