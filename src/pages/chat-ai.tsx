"use client";

import NewChatGemini from "@/components/NewChat";

export default function ChatAiPage() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-800 to-gray-700 text-white overflow-hidden">
      <NewChatGemini />
    </div>
  );
}
