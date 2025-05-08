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
    dpia: "Veri Koruma Etki Değerlendirmesi (DPIA)",
    logs: "Yer Sağlayıcı Kayıtları"
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
    dpia: "Data Protection Impact Assessment (DPIA)",
    logs: "Hosting Provider Logs"
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
        <li>Ad, soyad, kullanıcı adı</li>
        <li>E-posta adresi</li>
        <li>Profil bilgileri (fotoğraf, biyografi vb.)</li>
        <li>Gönderiler, yorumlar, özel mesajlar</li>
        <li>IP adresi ve cihaz bilgisi</li>
        <li>Çerez verileri ve tercihleri</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.purposes}</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Hizmet sunumu ve hesap yönetimi</li>
        <li>Gönderi paylaşımı ve sosyal etkileşim</li>
        <li>Güvenlik ve kötüye kullanım tespiti</li>
        <li>Performans iyileştirme ve analiz</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.storageTransfer}</h2>
      <p className="mb-4">
        Veriler yurtiçindeki veya yurtdışındaki güvenilir hizmet sağlayıcılarda saklanabilir (örn. ImageKit, OpenAI, socket.io).
        Yurtdışı aktarım KVKK’ya uygundur ve açık rıza ile gerçekleştirilir.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.retention}</h2>
      <p className="mb-4">
        Veriler amacın sona ermesi veya yasal zorunlulukların tamamlanması sonrası silinir veya anonimleştirilir. Hesap kapatma durumunda veriler makul sürede kaldırılır.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.security}</h2>
      <p className="mb-4">
        Şifreleme, erişim kontrolü, yedekleme ve güvenlik duvarı gibi önlemlerle veri güvenliği sağlanır.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.breach}</h2>
      <p className="mb-4">
        Yetkisiz erişim veya veri ihlali olması durumunda etkilenen kullanıcılara ve KVKK’ya derhal bildirim yapılır.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.rights}</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Kişisel verilere erişim</li>
        <li>Düzeltme, silme, yok etme</li>
        <li>Üçüncü kişilere aktarımlar hakkında bilgi alma</li>
        <li>İtiraz ve zarar tazmini talep etme</li>
      </ul>

      <p className="mb-4">
        Haklarınızı kullanmak için <strong>emrecancnzytnl@gmail.com</strong> adresine başvurabilirsiniz.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.cookies}</h2>
      <p className="mb-4">
        Çerezler, temel işlevler ve analiz için kullanılmaktadır. Detaylar için Çerez Politikası sayfasına göz atabilirsiniz.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.logs}</h2>
      <p className="mb-4">
        Platform, 5651 sayılı Kanun kapsamında yer sağlayıcı olarak erişim kayıtlarını 1 yıl süreyle saklamakla yükümlüdür.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t.dpia}</h2>
      <p className="mb-4">
        Özellikle mesajlaşma, analiz ve yapay zekâ özellikleri için düzenli Veri Koruma Etki Değerlendirmesi yapılmaktadır.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
