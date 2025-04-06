//src/policies/privacy-policy.tsx
/*Bu dosya, Undergo platformunun Gizlilik Politikası sayfasını oluşturan React bileşenidir ve kullanıcıların 
kişisel verilerinin nasıl toplandığını, işlendiğini, ne amaçla kullanıldığını, ne kadar süreyle saklandığını, 
hangi güvenlik önlemleriyle korunduğunu ve kullanıcıların KVKK/GDPR kapsamındaki haklarını açıklar; ayrıca 
kullanıcıların bu haklarını nasıl kullanabileceklerine dair iletişim bilgisi de sunar.*/
import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto text-sm leading-6">
      <h1 className="text-2xl font-bold mb-4">Gizlilik Politikası</h1>

      <p className="mb-4">
        Undergo platformu olarak, kullanıcılarımızın gizliliğine ve kişisel verilerinin korunmasına büyük önem veriyoruz.
        Bu gizlilik politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma
        Tüzüğü (GDPR) kapsamında, hangi kişisel verileri işlediğimizi, ne amaçla topladığımızı ve nasıl koruduğumuzu
        açıklamaktadır.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Toplanan Veriler</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Ad, soyad, kullanıcı adı</li>
        <li>E-posta adresi</li>
        <li>Profil bilgileri (fotoğraf, biyografi vb.)</li>
        <li>Paylaşılan gönderiler, yorumlar ve mesaj içerikleri</li>
        <li>IP adresi ve cihaz bilgileri</li>
        <li>Çerez verileri ve kullanıcı tercihleri</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Verilerin İşlenme Amaçları</h2>
      <p className="mb-4">
        Toplanan kişisel veriler aşağıdaki amaçlarla işlenmektedir:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Hizmetin sunulması ve kullanıcı hesaplarının yönetilmesi</li>
        <li>Gönderi paylaşımı ve sosyal etkileşimlerin sağlanması</li>
        <li>Güvenlik ve kötüye kullanım tespiti</li>
        <li>Platformun iyileştirilmesi ve istatistiksel analiz</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Verilerin Saklanma Süresi</h2>
      <p className="mb-4">
        Kişisel veriler, işleme amaçları sona erdiğinde silinir, yok edilir veya anonim hale getirilir. Kullanıcı hesabı
        silindiğinde veriler de makul süre içerisinde imha edilir.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Veri Güvenliği</h2>
      <p className="mb-4">
        Kişisel verilerinizin güvenliği için gerekli tüm teknik ve idari tedbirleri alıyoruz. Şifreleme, erişim kontrolleri,
        güvenlik duvarı gibi yöntemlerle veriler korunmaktadır.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Veri Sahibi Hakları</h2>
      <p className="mb-4">
        KVKK ve GDPR kapsamında, kullanıcıların kişisel verileriyle ilgili:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>İşlenip işlenmediğini öğrenme</li>
        <li>Düzeltme, silme veya yok edilmesini talep etme</li>
        <li>Aktarıldığı 3. kişileri bilme</li>
        <li>İtiraz etme ve zarar halinde tazminat isteme</li>
      </ul>

      <p className="mb-4">
        Bu haklarınızı kullanmak için bizimle <strong>destek@undergo.com</strong> adresi üzerinden iletişime geçebilirsiniz.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
