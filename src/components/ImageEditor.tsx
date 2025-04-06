//src/components/ImageEditor.tsx
/*Bu dosya, kullanıcının bir görselin önizlemesini yaparak formatını ("original", "wide", "square") seçebileceği ve içeriğin hassas (sensitive) 
olup olmadığını belirleyebileceği interaktif bir modal bileşeni olan ImageEditor'ı tanımlar; görsel ImageKit üzerinden optimize şekilde 
gösterilir ve kullanıcı bu modal üzerinden görsel ayarlarını yapıp "Save" butonuyla kapatabilir.*/
"use client";

import React, { useCallback } from "react";
import { IKImage } from "imagekitio-next";

type ImageEditorProps = {
  onClose: () => void;
  previewURL: string;
  settings: {
    type: "original" | "wide" | "square";
    sensitive: boolean;
  };
  setSettings: React.Dispatch<
    React.SetStateAction<{
      type: "original" | "wide" | "square";
      sensitive: boolean;
    }>
  >;
};

const ImageEditor = React.memo(function ImageEditor({
  onClose,
  previewURL,
  settings,
  setSettings,
}: ImageEditorProps) {
  const handleChangeSensitive = useCallback(
    (sensitive: boolean) => {
      setSettings((prev) => ({ ...prev, sensitive }));
    },
    [setSettings]
  );

  const handleChangeType = useCallback(
    (type: "original" | "wide" | "square") => {
      setSettings((prev) => ({ ...prev, type }));
    },
    [setSettings]
  );

  return (
    <div className="fixed w-screen h-screen left-0 top-0 bg-[#3E6A8A] bg-opacity-75 z-10 flex items-center justify-center">
      <div className="bg-[#FAFCF2] rounded-xl p-12 flex flex-col gap-4 shadow-lg border border-[#BDC4BF]">
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              onClick={onClose}
              className="cursor-pointer"
            >
              <path
                fill="#3E6A8A"
                d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"
              />
            </svg>
            <h1 className="font-bold text-xl text-[#3E6A8A]">Media Setting</h1>
          </div>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-full bg-[#A8DBF0] text-[#3E6A8A] font-bold border border-[#3E6A8A]"
          >
            Save
          </button>
        </div>

        {/* IMAGE CONTAINER */}
        <div className="w-[600px] h-[600px] flex items-center bg-[#A8DBF0] rounded-lg overflow-hidden shadow-md">
          <IKImage
            urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT || ""}
            path={previewURL}
            alt=""
            className={`w-full ${
              settings.type === "original"
                ? "h-full object-contain"
                : settings.type === "square"
                ? "aspect-square object-cover"
                : "aspect-video object-cover"
            }`}
            lqip={{ active: true, quality: 20 }}
            crossOrigin="use-credentials" // HTTP‑only çerezler için eklenmiştir.
          />
        </div>

        {/* SETTINGS */}
        <div className="flex items-center justify-between text-sm text-[#3E6A8A]">
          <div className="flex items-center gap-8">
            <div
              onClick={() => handleChangeType("original")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <svg width={24} viewBox="0 0 24 24">
                <path
                  className={
                    settings.type === "original"
                      ? "fill-[#3E6A8A]"
                      : "fill-[#BDC4BF]"
                  }
                  d="M3 7.5C3 6.119 4.119 5 5.5 5h13C19.881 5 21 6.119 21 7.5v9c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 19 3 17.881 3 16.5v-9zM5.5 7c-.276 0-.5.224-.5.5v9c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-9c0-.276-.224-.5-.5-.5h-13z"
                />
              </svg>
              Original
            </div>

            <div
              onClick={() => handleChangeType("wide")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <svg width={24} viewBox="0 0 24 24">
                <path
                  className={
                    settings.type === "wide"
                      ? "fill-[#3E6A8A]"
                      : "fill-[#BDC4BF]"
                  }
                  d="M3 7.5C3 6.119 4.119 5 5.5 5h13C19.881 5 21 6.119 21 7.5v9c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 19 3 17.881 3 16.5v-9zM5.5 7c-.276 0-.5.224-.5.5v9c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-9c0-.276-.224-.5-.5-.5h-13z"
                />
              </svg>
              Wide
            </div>

            <div
              onClick={() => handleChangeType("square")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <svg width={24} viewBox="0 0 24 24">
                <path
                  className={
                    settings.type === "square"
                      ? "fill-[#3E6A8A]"
                      : "fill-[#BDC4BF]"
                  }
                  d="M3 7.5C3 6.119 4.119 5 5.5 5h13C19.881 5 21 6.119 21 7.5v9c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 19 3 17.881 3 16.5v-9zM5.5 7c-.276 0-.5.224-.5.5v9c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-9c0-.276-.224-.5-.5-.5h-13z"
                />
              </svg>
              Square
            </div>
          </div>
          <div
            className={`cursor-pointer py-1 px-4 rounded-full text-white ${
              settings.sensitive ? "bg-red-500" : "bg-[#A8DBF0]"
            }`}
            onClick={() => handleChangeSensitive(!settings.sensitive)}
          >
            Sensitive
          </div>
        </div>
      </div>
    </div>
  );
});

export default ImageEditor;
