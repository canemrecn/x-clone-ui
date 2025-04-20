// src/app/settings/dm-export/page.tsx
import DownloadDmData from "@/components/DownloadDmData";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <h1 className="text-2xl font-bold p-6">Mesaj Verisi İndir</h1>
      <DownloadDmData />
    </div>
  );
}
