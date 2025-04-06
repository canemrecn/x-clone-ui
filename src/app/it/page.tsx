//src/app/it/page.tsx
/*Bu dosya, /it (İtalyanca) sayfasını temsil eder ve LanguageFeed bileşenini lang="it" propuyla çağırarak yalnızca İtalyanca içeriklerin 
listelenmesini sağlar.*/
import LanguageFeed from "@/components/LanguageFeed";

export default function ItalianPage() {
  return <LanguageFeed lang="it" />;
}
