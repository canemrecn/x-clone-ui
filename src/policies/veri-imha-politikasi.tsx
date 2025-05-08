//src/policies/veri-imha-politikasi.tsx
/*Bu dosya, Undergo platformunun Kişisel Veri Saklama ve İmha Politikası sayfasını oluşturan bir React 
bileşenidir; kullanıcı verilerinin KVKK ve ilgili mevzuata uygun olarak ne kadar süreyle saklanacağını, 
süresi dolan verilerin nasıl silineceğini, yok edileceğini veya anonim hale getirileceğini, kullanılan 
imha yöntemlerini ve kullanıcıların veri silme taleplerini nasıl iletebileceklerini açıklayarak platformun 
veri güvenliği ve yasal uyumluluk politikasını açıklar.*/
import React from "react";

const VeriImhaPolitikasi = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto text-sm leading-6">
      <h1 className="text-2xl font-bold mb-4">Kişisel Veri Saklama ve İmha Politikası</h1>

      <p className="mb-4">
        Bu politika, Undergo platformu tarafından işlenen kişisel verilerin, 6698 sayılı KVKK ve ilgili mevzuata uygun
        şekilde ne süreyle saklanacağını, ne zaman ve hangi yöntemlerle imha edileceğini düzenler.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Verilerin Saklanma Süresi</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Kullanıcı hesabı aktif olduğu sürece veriler saklanır.</li>
        <li>Kullanıcı hesabı silindikten sonra kişisel veriler 180 gün içinde imha edilir.</li>
        <li>İletişim kayıtları (destek talepleri, e-postalar) en fazla 1 yıl saklanır.</li>
        <li>Yasal zorunluluk gereği tutulan log kayıtları 2 yıl süreyle saklanır.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Verilerin Silinmesi ve Yok Edilmesi</h2>
      <p className="mb-4">
        Saklama süresi dolan kişisel veriler, düzenli aralıklarla silinir, yok edilir veya anonim hale getirilir. Silme işlemi,
        verinin ilgili kullanıcı veya işlemle ilişiğinin tamamen ortadan kaldırılması şeklinde gerçekleştirilir.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">İmha Yöntemleri</h2>
      <ul className="list-disc list-inside mb-4">
        <li><strong>Yazılımdan silme:</strong> Veriler güvenli bir şekilde veritabanından silinir.</li>
        <li><strong>Fiziksel imha:</strong> Fiziksel ortamdaki belgeler güvenli bir şekilde yok edilir.</li>
        <li><strong>Anonimleştirme:</strong> Veriler, kimlikle ilişkilendirilemeyecek hale getirilir.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Kullanıcı Talepleri</h2>
      <p className="mb-4">
        Kullanıcılar, kişisel verilerinin silinmesini <strong>emrecancnzytnl@gmail.com</strong> adresine başvurarak talep edebilir.
        Başvurular en geç 30 gün içinde sonuçlandırılır.
      </p>

      <p>
        Platform, tüm silme ve imha işlemlerini kaydederek yasal yükümlülüklere uygun şekilde işlemektedir.
      </p>
    </div>
  );
};

export default VeriImhaPolitikasi;
