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
        şekilde ne süreyle saklanacağını, ne zaman ve hangi yöntemlerle imha edileceğini düzenlemektedir.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Verilerin Saklanma Süresi</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Kullanıcı hesabı açık olduğu sürece veriler saklanır.</li>
        <li>Kullanıcı hesabı silindikten sonra veriler 180 gün içinde imha edilir.</li>
        <li>İletişim kayıtları (destek talepleri, e-postalar) en fazla 1 yıl saklanır.</li>
        <li>Yasal yükümlülüklerden doğan veriler (log kayıtları) 2 yıl süreyle saklanır.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Verilerin Silinmesi ve Yok Edilmesi</h2>
      <p className="mb-4">
        Saklama süresi dolan kişisel veriler, periyodik olarak silinir, yok edilir veya anonim hale getirilir. Silme işlemi,
        verinin ilgili kullanıcı veya işlemle ilişiğinin kalmaması şeklinde gerçekleştirilir.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">İmha Yöntemleri</h2>
      <ul className="list-disc list-inside mb-4">
        <li><strong>Yazılımdan silme:</strong> Veritabanından güvenli şekilde silinir.</li>
        <li><strong>Fiziksel imha:</strong> Fiziksel ortamdaki belgeler imha edilir.</li>
        <li><strong>Anonimleştirme:</strong> Kimlikle ilişkilendirilemeyecek hale getirilir.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Kullanıcı Talepleri</h2>
      <p className="mb-4">
        Kullanıcılar, verilerinin silinmesini <strong>kvkk@undergo.com</strong> adresine başvurarak talep edebilir.
        Talep en geç 30 gün içinde sonuçlandırılır.
      </p>

      <p>
        Platformumuz, silme ve imha işlemlerini belgeleyerek yasal yükümlülüklere uygun şekilde işlemektedir.
      </p>
    </div>
  );
};

export default VeriImhaPolitikasi;
