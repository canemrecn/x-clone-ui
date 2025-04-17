// components/LanguageModal.tsx
"use client";

import React from "react";

interface LanguageModalProps {
  selectedLang: string;
  onSelect: (lang: string) => void;
  onClose: () => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({ selectedLang, onSelect, onClose }) => {
  const languages = [
    { code: "en", label: "İngilizce" },
    { code: "tr", label: "Türkçe" },
    { code: "de", label: "Almanca" },
    { code: "fr", label: "Fransızca" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-md text-white">
        <h2 className="text-xl font-semibold mb-4">Günlük Dilini Seç</h2>
        <div className="flex flex-col gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className={`py-2 px-4 rounded text-left border border-gray-500 hover:bg-gray-700 transition ${
                selectedLang === lang.code ? "bg-gray-600" : ""
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 block w-full bg-red-600 hover:bg-red-700 py-2 px-4 rounded text-white font-bold"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};

export default LanguageModal;
