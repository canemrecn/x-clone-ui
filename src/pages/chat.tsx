// src/app/chat/page.tsx (veya src/pages/chat.tsx - Proje yapısına göre)
"use client";

import GeminiChat from "@/components/GeminiChat";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-white p-4">
      <GeminiChat />
    </div>
  );
}
