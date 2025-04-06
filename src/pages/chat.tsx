//src/pages/chat.tsx
/*Bu dosya, /chat sayfasını tanımlar ve sayfada yapay zekâ tabanlı sohbet bileşeni olan <GeminiChat />'i 
render eder. Sayfa tasarımı minimum ekran yüksekliğinde olacak şekilde ayarlanmış, arka plan koyu gri 
degrade ve metin rengi beyazdır. Kullanıcılar bu sayfada yapay zekâ ile etkileşimli bir sohbet gerçekleştirebilir.*/
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import GeminiChat from "@/components/GeminiChat";

export default function ChatPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth?.user) {
      router.push("/login"); // or "/register"
    }
  }, [auth?.user, router]);

  if (!auth?.user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4">
      <GeminiChat />
    </div>
  );
}
