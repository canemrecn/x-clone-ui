// src/app/chat-ai/page.tsx (Next.js 13 /app yapısı)
// veya pages/chat-ai.tsx (Next.js 12)
"use client";

import NewChatGemini from "@/components/NewChat";

export default function ChatAiPage() {
  return (
    <div className="h-screen flex flex-col bg-[#FAFCF2] text-black">
      {/* Üst bar (isteğe bağlı) */}
      <div className="p-4 bg-[#3E6A8A] text-white flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat AI</h1>
        {/* Örnek geri butonu isterseniz:
          <button onClick={() => router.back()} className="text-white">Back</button> 
        */}
      </div>

      {/* Chat içeriği */}
      <div className="flex-1 overflow-hidden">
        <NewChatGemini />
      </div>
    </div>
  );
}

