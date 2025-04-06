//src/app/ru/page.tsx
/*Bu dosya, Rusça içeriklerin listeleneceği sayfa bileşenidir; LanguageFeed bileşenini lang="ru" parametresiyle çağırarak sadece Rusça 
diline ait gönderilerin gösterilmesini sağlar.*/
import LanguageFeed from "@/components/LanguageFeed";

export default function RussianPage() {
  return <LanguageFeed lang="ru" />;
}
