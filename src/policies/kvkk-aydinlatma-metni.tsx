//src/policies/kvkk-aydinlatma-metni.tsx
/*Bu dosya, Undergo platformunun 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında kullanıcıları 
bilgilendirmek amacıyla hazırladığı aydınlatma metnini sunar. Sayfada; veri sorumlusunun kim olduğu, hangi 
kişisel verilerin işlendiği, verilerin hangi amaçlarla ve hangi yöntemlerle toplandığı, kimlerle 
paylaşılabileceği, yurt dışına aktarım şartları ile kullanıcıların KVKK’nın 11. maddesi kapsamında sahip 
oldukları haklar (örneğin veriye erişim, düzeltme, silme, itiraz) açık şekilde belirtilir. Kullanıcıların 
bu haklarını nasıl kullanabileceği de gösterilir ve resmi başvuru e-posta adresi paylaşılır. Sayfa React 
ile yazılmış, duyarlı ve okunabilir bir metin yapısıyla oluşturulmuştur.*/
import React from "react";

const KvkkAydinlatmaMetni = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto text-sm leading-6">
      <h1 className="text-2xl font-bold mb-4">KVKK Aydınlatma Metni</h1>

      <p className="mb-4">
        6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu sıfatıyla Undergo platformunu işleten kişi olarak kişisel verilerinizi aşağıda açıklanan kapsamda işlemekteyim.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Veri Sorumlusu</h2>
      <p className="mb-4">
        Emrecan Zeytünlü <br />
        E-posta: emrecancnzytnl@gmail.com
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">İşlenen Kişisel Veriler</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Kimlik bilgileri (ad, soyad, kullanıcı adı)</li>
        <li>İletişim bilgileri (e-posta adresi)</li>
        <li>Profil verileri (fotoğraf, biyografi, gönderiler)</li>
        <li>Mesajlar ve yorumlar</li>
        <li>IP adresi ve cihaz bilgileri</li>
        <li>Çerez verileri</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Veri İşleme Amaçları</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Platform hizmetlerinin sunulması</li>
        <li>Kullanıcı hesabı oluşturulması ve yönetimi</li>
        <li>İletişim ve bilgilendirme faaliyetlerinin yürütülmesi</li>
        <li>Hukuki yükümlülüklerin yerine getirilmesi</li>
        <li>İstatistiksel analiz ve iyileştirme çalışmaları</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Veri Toplama Yöntemleri</h2>
      <p className="mb-4">
        Kişisel veriler; kullanıcı kayıt formları, profil güncellemeleri, platform içi etkileşimler (gönderi, yorum, mesaj) ve çerezler aracılığıyla elektronik ortamda toplanmaktadır.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Verilerin Aktarımı</h2>
      <p className="mb-4">
        Kişisel verileriniz yalnızca hizmet alınan üçüncü taraf tedarikçiler (örneğin; barındırma ve analiz sağlayıcıları) ile ve yasal yükümlülükler çerçevesinde resmi kurumlarla paylaşılmaktadır. Yurt dışına veri aktarımı, yalnızca açık rızanız doğrultusunda gerçekleştirilmektedir.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Veri Sahibi Hakları</h2>
      <p className="mb-4">
        KVKK’nın 11. maddesi uyarınca, kullanıcılar kişisel verilerine ilişkin olarak aşağıdaki haklara sahiptir:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Kişisel verilerinin işlenip işlenmediğini öğrenme</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme</li>
        <li>Verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>Verilerin yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
        <li>KVKK’da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
        <li>Düzeltme, silme veya yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
        <li>İşlenen verilerin münhasıran otomatik sistemler aracılığıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
        <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme</li>
      </ul>

      <p className="mb-4">
        Bu haklarınızı kullanmak için <strong>emrecancnzytnl@gmail.com</strong> adresine başvuru yapabilirsiniz.
      </p>
    </div>
  );
};

export default KvkkAydinlatmaMetni;
