//src/app/en/page.tsx
/*Bu dosya, İngilizce içerikler için bir sayfa bileşenidir. LanguageFeed adlı bileşeni çağırır ve ona lang="en" prop’unu vererek yalnızca İngilizce 
dilinde paylaşılan gönderilerin gösterilmesini sağlar. Sayfa /en rotasında çalışır ve İngilizce içerik akışını listeler.*/
import LanguageFeed from "@/components/LanguageFeed";

export default function EnglishPage() {
  return <LanguageFeed lang="en" />;
}