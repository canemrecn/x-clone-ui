//src/pages/chat-ai.tsx
/*Bu dosya, /chat-ai URL'ine karşılık gelen sayfa bileşenini tanımlar ve sayfa boyunca tam ekran yüksekliğe 
sahip bir yapıda yapay zekâ sohbet bileşeni olan <NewChatGemini />'yi render eder. Arka planı koyu bir degrade 
(gray-800'den gray-700'e) olarak ayarlanmış ve metin rengi beyazdır. Bu sayfa, kullanıcıların yapay zekâ 
destekli bir sohbet deneyimi yaşamasını sağlar.*/
"use client"

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NewChatGemini from "@/components/NewChat";

export default function ChatAiPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth?.user) {
      router.push("/login");
    }
  }, [auth?.user, router]);

  if (!auth?.user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      <NewChatGemini />
    </div>
  );
}
