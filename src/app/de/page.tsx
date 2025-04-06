// src/app/de/page.tsx
/*Bu dosya, Next.js uygulamasında Almanca (de) içerikler için kullanılan sayfa bileşenidir. LanguageFeed adlı bileşeni çağırarak ona lang="de" 
prop’u iletir; böylece LanguageFeed bileşeni yalnızca Almanca içerikleri gösterir. Sayfa /de rotasında çalışır ve dil temelli içerik filtreleme 
amacıyla kullanılır.*/
import LanguageFeed from "@/components/LanguageFeed";

/**
 * Bu sayfa, Almanca içerikleri görüntülemek için kullanılan bileşendir.
 * LanguageFeed bileşeni, 'lang' prop'u ile belirlenen dildeki içerikleri filtreler.
 * Bu sayfa /de rotasında çalışır ve Almanca içerikleri gösterir.
 */
export default function GermanPage() {
  return <LanguageFeed lang="de" />;
}
