//src/app/tr/page.tsx
/*Bu dosya, /tr yoluna karşılık gelen sayfa bileşenidir ve LanguageFeed adlı bileşeni Türkçe içerik gösterecek şekilde lang="tr" prop'u 
ile render ederek kullanıcılara Türkçe gönderilerin yer aldığı bir içerik akışı sunar.*/
import LanguageFeed from "@/components/LanguageFeed";

export default function TurkeyPage() {
  return <LanguageFeed lang="tr" />;
}
