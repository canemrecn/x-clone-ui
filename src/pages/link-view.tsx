//src/pages/link-view.tsx
/*Bu dosya, /link-view sayfasını tanımlar ve URL parametresi olarak gelen url değerini alarak, bu bağlantıyı 
tam sayfa olarak bir <iframe> içinde görüntüler; eğer url değeri henüz alınmamışsa "Yükleniyor..." mesajı 
gösterir. Kullanıcıyı başka bir siteye yönlendirmeden site içerisinde o bağlantıyı görmesini sağlar.*/
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const LinkViewPage = () => {
  const router = useRouter();
  const { url } = router.query;
  const [targetUrl, setTargetUrl] = useState<string>("");

  useEffect(() => {
    if (typeof url === "string") {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        setTargetUrl(url);
      } else {
        console.warn("❌ Geçersiz veya güvensiz URL engellendi:", url);
        setTargetUrl("");
      }
    }
  }, [url]);

  if (!targetUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-800 to-gray-700">
      <iframe
        src={targetUrl}
        className="w-full h-full"
        frameBorder="0"
        title="Link View"
      ></iframe>
    </div>
  );
};

export default LinkViewPage;
