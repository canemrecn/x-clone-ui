// src/components/LegalComplianceBadges.tsx
"use client";

export default function LegalComplianceBadges() {
  return (
    <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
      <span className="bg-green-700 text-white px-2 py-1 rounded">✅ KVKK Uyumlu</span>
      {/*<span className="bg-blue-700 text-white px-2 py-1 rounded">✅ GDPR Compatible</span>*/}
    </div>
  );
}
