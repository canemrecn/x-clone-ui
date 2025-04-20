// src/policies/data-processing.tsx
/* Bu dosya, Undergo platformunun üçüncü taraf veri işleyicilerle yaptığı sözleşmeleri ve kullanıcıların bu kapsamdaki haklarını açıklayan Veri İşleyici Sözleşmeleri (DPA) sayfasıdır. */

import React from "react";

export default function DataProcessingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-white leading-7 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Veri İşleyici Sözleşmeleri (Data Processing Agreements - DPA)</h1>

      <p className="mb-4">
        UnderGo platformu olarak, kullanıcılarımızın kişisel verilerini yalnızca gerekli durumlarda ve güvenilir hizmet sağlayıcılarla paylaşmaktayız. 
        Bu hizmet sağlayıcılarla yapılan Veri İşleyici Sözleşmeleri (DPA), KVKK ve GDPR hükümlerine uygundur.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. DPA Nedir?</h2>
      <p className="mb-4">
        DPA (Data Processing Agreement), kişisel verilerin işlenmesine dair sorumlulukların veri sorumlusu (UnderGo) ve veri işleyici (örneğin OpenAI) arasında açıkça tanımlandığı yasal bir sözleşmedir.
        Bu sözleşmeler, kullanıcı verilerinin güvenliğini, gizliliğini ve yalnızca belirtilen amaçlar doğrultusunda kullanılmasını garanti altına alır.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Anlaşmalı Hizmet Sağlayıcılarımız</h2>
      <ul className="list-disc pl-5 mb-4">
        <li>
          <strong>OpenAI</strong>: Yapay zeka sohbet ve analiz hizmetleri.{" "}
          <a
            href="https://openai.com/policies/data-processing-addendum"
            className="underline text-cyan-400"
            target="_blank"
          >
            DPA Detayları
          </a>
        </li>
        <li>
          <strong>ImageKit</strong>: Görsel barındırma ve optimizasyon hizmetleri.{" "}
          <a
            href="https://imagekit.io/legal/data-processing-agreement"
            className="underline text-cyan-400"
            target="_blank"
          >
            DPA Detayları
          </a>
        </li>
        <li>
          <strong>Socket.io</strong>: Gerçek zamanlı iletişim altyapısı. DPA kapsamına alınmıştır.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Sorumluluklar</h2>
      <p className="mb-4">
        UnderGo, bu hizmet sağlayıcıların veri güvenliği yükümlülüklerini yerine getirdiğini denetlemekle ve kullanıcı verilerini yalnızca yasal ve belirtilen amaçlar çerçevesinde işlemekle yükümlüdür.
        Her hizmet sağlayıcı ile imzalanan DPA metinleri, GDPR Madde 28 ile uyumludur.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Kullanıcı Hakları</h2>
      <p className="mb-4">
        Kullanıcılarımız, verilerinin hangi işleyicilerle paylaşıldığını öğrenme, onaylarını geri çekme ve veri silinmesini talep etme haklarına sahiptir.
        Bu hakları kullanmak için{" "}
        <a href="mailto:destek@undergo.com" className="underline text-cyan-400">
          destek@undergo.com
        </a>{" "}
        adresi üzerinden bize ulaşabilirsiniz.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Gelecekteki Entegrasyonlar</h2>
      <p className="mb-4">
        UnderGo platformuna yeni üçüncü taraf servisler eklendiğinde, veri işleme süreçleri gözden geçirilir ve ilgili DPA’lar güncellenir.
        Güncel liste bu sayfada ilan edilir.
      </p>
    </div>
  );
}
