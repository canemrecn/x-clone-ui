import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const LinkViewPage = () => {
  const router = useRouter();
  const { url } = router.query;
  const [targetUrl, setTargetUrl] = useState<string>("");

  useEffect(() => {
    if (typeof url === "string") {
      setTargetUrl(url);
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
