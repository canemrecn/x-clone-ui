//src/policies/terms-of-service.tsx
/*Bu dosya, Undergo platformunun Kullanım Şartları sayfasını oluşturan bir React bileşenidir ve platformu 
kullanan tüm kullanıcılar için geçerli olan kuralları açıklar; hizmetin kapsamı, kullanıcı yükümlülükleri, 
fikri mülkiyet hakları, hesap askıya alma/silme, sorumluluk sınırlamaları, şartlarda yapılabilecek 
değişiklikler ve geçerli hukuk-yetki konularını düzenleyerek kullanıcıları bilgilendirir ve bu şartları 
kabul etmeleri gerektiğini belirtir.*/
import React from "react";

const TermsOfService = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto text-sm leading-6">
      <h1 className="text-2xl font-bold mb-4">Kullanım Şartları</h1>

      <p className="mb-4">
        Bu kullanım şartları, Undergo platformuna erişen ve kullanan tüm kullanıcılar için geçerlidir. Platformu
        kullanarak bu şartları kabul etmiş sayılırsınız.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Hizmetin Kapsamı</h2>
      <p className="mb-4">
        Undergo, kullanıcıların içerik paylaşabildiği, dil öğrenme ve sosyal etkileşim odaklı bir dijital platformdur. Bu
        hizmetlerin içeriği, kapsamı ve erişim koşulları zaman zaman güncellenebilir.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Kullanıcı Yükümlülükleri</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Verdiğiniz bilgilerin doğru ve güncel olduğunu taahhüt edersiniz.</li>
        <li>Hesap güvenliğinizden siz sorumlusunuz.</li>
        <li>Yasalara aykırı, nefret söylemi veya müstehcen içerik paylaşamazsınız.</li>
        <li>Başka kullanıcıların haklarına saygı göstermekle yükümlüsünüz.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Fikri Mülkiyet Hakları</h2>
      <p className="mb-4">
        Platformda sunulan tüm içerikler (tasarım, logo, yazılım kodları vb.), Undergo'ya veya lisans verenlerine aittir.
        İzinsiz kopyalanamaz veya ticari amaçla kullanılamaz.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Hesabın Askıya Alınması ve Silinmesi</h2>
      <p className="mb-4">
        Kullanım şartlarını ihlal etmeniz halinde, hesabınız geçici veya kalıcı olarak askıya alınabilir ya da silinebilir.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Sorumluluğun Sınırlandırılması</h2>
      <p className="mb-4">
        Platform, kullanıcıların paylaştığı içeriklerden doğrudan sorumlu değildir. Ancak şikayet üzerine uygunsuz içerikler
        kaldırılabilir. Teknik sorunlar ve erişim kesintileri nedeniyle doğabilecek zararlardan dolayı platformun sorumluluğu
        sınırlıdır.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Değişiklik Hakkı</h2>
      <p className="mb-4">
        Undergo, bu kullanım şartlarını önceden bildirmeksizin güncelleme hakkını saklı tutar. Güncellenen şartlar platformda
        yayımlandığı andan itibaren geçerli olur.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Uygulanacak Hukuk ve Yetki</h2>
      <p className="mb-4">
        Bu sözleşme Türkiye Cumhuriyeti yasalarına tabidir. Taraflar, doğabilecek ihtilaflarda Ankara Mahkemeleri ve İcra Dairelerinin
        yetkili olduğunu kabul eder.
      </p>

      <p className="mt-6">
        Platformu kullanmaya devam ederek bu şartları kabul etmiş sayılırsınız. Sorularınız için <strong>destek@undergo.com</strong>
        adresine ulaşabilirsiniz.
      </p>
    </div>
  );
};

export default TermsOfService;