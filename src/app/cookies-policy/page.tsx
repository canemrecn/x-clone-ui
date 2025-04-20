// src/app/cookies-policy/page.tsx
// src/app/cookies-policy/page.tsx
"use client";

import React, { useState } from "react";

const translations = {
  tr: {
    title: "Çerez Politikası",
    intro:
      "UnderGo olarak, kullanıcı deneyiminizi iyileştirmek ve hizmetlerimizi geliştirmek amacıyla çerezler kullanmaktayız. Bu çerez politikası, hangi tür çerezleri kullandığımızı, ne amaçla kullandığımızı ve bu çerezleri nasıl yönetebileceğinizi açıklar.",
    sections: [
      {
        title: "1. Çerez Nedir?",
        content:
          "Çerezler, ziyaret ettiğiniz web siteleri tarafından tarayıcınıza yerleştirilen küçük veri dosyalarıdır. Sizinle ilgili bazı bilgileri hatırlamamıza yardımcı olur."
      },
      {
        title: "2. Hangi Çerezleri Kullanıyoruz?",
        content: [
          "Kesinlikle Gerekli Çerezler: Giriş yapma, dil tercihi gibi temel işlemler için kullanılır.",
          "Analitik Çerezler: Siteyi nasıl kullandığınızı anonim olarak anlamamıza yardımcı olur. (ör. Google Analytics)",
          "Reklam ve Hedefleme Çerezleri: İlgi alanlarınıza uygun reklamlar göstermek için kullanılır."
        ]
      },
      {
        title: "3. Çerezleri Nasıl Kontrol Edebilirim?",
        content:
          "Sitemizi ilk ziyaretinizde, çerezleri kabul etmeniz için size bir seçenek sunarız. Daha sonra tarayıcı ayarlarınızdan da çerezleri silebilir veya engelleyebilirsiniz."
      },
      {
        title: "4. Veri Paylaşımı",
        content:
          "Analitik veriler, sadece anonim olarak üçüncü taraf servislerle (ör. Google Analytics) paylaşılır. Kişisel bilgileriniz izniniz olmadan paylaşılmaz."
      },
      {
        title: "5. İletişim",
        content:
          "Herhangi bir sorunuz olursa support@undergo.com adresinden bize ulaşabilirsiniz."
      }
    ]
  },
  en: {
    title: "Cookie Policy",
    intro:
      "At UnderGo, we use cookies to improve your experience and enhance our services. This cookie policy explains what types of cookies we use, for what purposes, and how you can manage them.",
    sections: [
      {
        title: "1. What is a Cookie?",
        content:
          "Cookies are small data files placed on your browser by websites you visit. They help us remember certain information about you."
      },
      {
        title: "2. What Cookies Do We Use?",
        content: [
          "Strictly Necessary Cookies: Used for essential functions like login and language preferences.",
          "Analytics Cookies: Help us understand how you use the site anonymously (e.g. Google Analytics).",
          "Advertising and Targeting Cookies: Used to display ads relevant to your interests."
        ]
      },
      {
        title: "3. How Can I Control Cookies?",
        content:
          "When you first visit our site, we offer you a choice to accept cookies. You can also delete or block cookies from your browser settings at any time."
      },
      {
        title: "4. Data Sharing",
        content:
          "Analytical data is shared only anonymously with third-party services (e.g. Google Analytics). Your personal data is not shared without your consent."
      },
      {
        title: "5. Contact",
        content:
          "If you have any questions, feel free to contact us at support@undergo.com."
      }
    ]
  }
};

export default function CookiesPolicyPage() {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const t = translations[lang];

  return (
    <div className="max-w-4xl mx-auto p-6 text-white leading-7 bg-gray-900 min-h-screen">
      <div className="flex justify-end mb-4">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as "tr" | "en")}
          className="text-black p-2 rounded-md"
        >
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
        </select>
      </div>

      <h1 className="text-3xl font-bold mb-4">{t.title}</h1>
      <p className="mb-4">{t.intro}</p>

      {t.sections.map((section, i) => (
        <div key={i}>
          <h2 className="text-2xl font-semibold mt-6 mb-2">{section.title}</h2>
          {Array.isArray(section.content) ? (
            <ul className="list-disc pl-5 mb-4">
              {section.content.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mb-4">{section.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}