// src/policies/privacy-policy.tsx
/*Bu dosya, Undergo platformunun Gizlilik Politikası sayfasını oluşturan React bileşenidir ve kullanıcıların 
kişisel verilerinin nasıl toplandığını, işlendiğini, ne amaçla kullanıldığını, ne kadar süreyle saklandığını, 
hangi güvenlik önlemleriyle korunduğunu ve kullanıcıların KVKK/GDPR kapsamındaki haklarını açıklar; ayrıca 
kullanıcıların bu haklarını nasıl kullanabileceklerine dair iletişim bilgisi de sunar.*/
// src/policies/privacy-policy.tsx
"use client";

import React, { useState } from "react";

const translations = {
  tr: {
    title: "Gizlilik Politikası",
    intro:
      "Undergo platformu olarak, kullanıcılarımızın gizliliğine ve kişisel verilerinin korunmasına büyük önem veriyoruz. Bu gizlilik politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, hangi kişisel verileri işlediğimizi, ne amaçla topladığımızı ve nasıl koruduğumuzu açıklamaktadır. Platform yalnızca Türkiye Cumhuriyeti sınırları içinde hizmet vermektedir.",
    collectedData: "Toplanan Veriler",
    purposes: "Verilerin İşlenme Amaçları",
    storageTransfer: "Verilerin Saklandığı Yer ve Yurtdışına Aktarım",
    retention: "Verilerin Saklanma Süresi",
    security: "Veri Güvenliği",
    breach: "Veri İhlali Durumunda Bilgilendirme",
    rights: "Veri Sahibi Hakları",
    cookies: "Çerezler ve Takip Teknolojileri",
    dpia: "Veri Koruma Etki Değerlendirmesi (DPIA)"
  },
  en: {
    title: "Privacy Policy",
    intro:
      "At Undergo, we take our users' privacy and personal data protection very seriously. This privacy policy explains which personal data we process, for what purpose, and how we protect it in accordance with the Turkish Personal Data Protection Law (KVKK). The platform is currently only available in the Republic of Turkey.",
    collectedData: "Collected Data",
    purposes: "Purposes of Data Processing",
    storageTransfer: "Data Storage and Transfer Abroad",
    retention: "Data Retention Period",
    security: "Data Security",
    breach: "Notification in Case of Data Breach",
    rights: "Data Subject Rights",
    cookies: "Cookies and Tracking Technologies",
    dpia: "Data Protection Impact Assessment (DPIA)"
  }
};

const PrivacyPolicy = () => {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const t = translations[lang];

  return (
    <div className="p-6 max-w-4xl mx-auto text-sm leading-6">
      <div className="mb-6">
        <label htmlFor="lang" className="mr-2 font-medium">
          Dil / Language:
        </label>
        <select
          id="lang"
          className="p-1 border rounded text-black"
          value={lang}
          onChange={(e) => setLang(e.target.value as "tr" | "en")}
        >
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
        </select>
      </div>

      <h1 className="text-2xl font-bold mb-4">{t.title}</h1>
      <p className="mb-4">{t.intro}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.collectedData}</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Name, surname, username</li>
        <li>Email address</li>
        <li>Profile info (photo, bio, etc.)</li>
        <li>Posts, comments, direct messages</li>
        <li>IP address and device info</li>
        <li>Cookie data and preferences</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.purposes}</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Service delivery and account management</li>
        <li>Post sharing and social interaction</li>
        <li>Security and abuse detection</li>
        <li>Performance improvement and analytics</li>
        <li>Fulfilling legal obligations</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.storageTransfer}</h2>
      <p className="mb-4">
        We may use servers located abroad (e.g. ImageKit, OpenAI, socket.io). By using the platform, you consent to international data transfer.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.retention}</h2>
      <p className="mb-4">
        Data is deleted, destroyed or anonymized when the processing purpose ends. When an account is deleted, the data is also removed within a reasonable time.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.security}</h2>
      <p className="mb-4">
        We implement necessary security measures including encryption, access controls, firewall, and logging.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.breach}</h2>
      <p className="mb-4">
        In case of unauthorized access or data breach, affected users will be notified via email as soon as possible.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.rights}</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Access to your personal data</li>
        <li>Correction, deletion, or erasure</li>
        <li>Knowledge of third-party transfers</li>
        <li>Objection and request for compensation</li>
      </ul>

      <p className="mb-4">
        To exercise your rights, contact us at <strong>destek@undergo.com</strong>.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.cookies}</h2>
      <p className="mb-4">
        Our site uses essential, analytical and marketing cookies. Visit our <a href="/cookies-policy" className="underline text-cyan-400">Cookies Policy</a> page for details and preferences.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.dpia}</h2>
      <p className="mb-4">
        We conduct regular DPIA assessments especially for features like messaging, analytics and AI-powered functionalities.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
