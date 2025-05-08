//src/policies/acik-riza-metni.tsx
/*Bu dosya, KVKK ve GDPR kapsamında kullanıcıdan alınacak açık rıza beyanını içeren bilgilendirme sayfasını 
oluşturur. Sayfa, ticari elektronik ileti gönderimi, verilerin yurtdışına aktarılması ve analiz/reklam 
çerezlerinin kullanımı gibi konularda kullanıcıya bilgilendirme yapar ve her bir konu için ayrı ayrı 
onay kutusu sunulacak şekilde yapılandırılmıştır. Kullanıcı, bu metni okuyarak hangi konularda onay 
verdiğini anlayabilir ve dilediği zaman rızasını geri çekebileceği bilgisini alır. Sayfa sade ve resmi 
bir dille yazılmış, mobil uyumlu bir React bileşeni olarak tasarlanmıştır.*/
import React from "react";

const AcikRizaMetni = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto text-sm leading-6">
      <h1 className="text-2xl font-bold mb-4">Açık Rıza Metni</h1>

      <p className="mb-4">
        6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR)
        kapsamında, kişisel verilerinizin belirli işlemleri için açık rızanız alınmaktadır. Aşağıda yer alan durumlara ilişkin
        açık rızanızı vermeniz tamamen özgür iradenize bağlıdır. Rızanızı dilediğiniz zaman geri çekme hakkınız bulunmaktadır.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Ticari Elektronik İleti Gönderimi</h2>
      <p className="mb-4">
        Kampanya, duyuru ve bilgilendirmelerin e-posta yoluyla gönderilebilmesi için açık rızanız gerekmektedir.
        Onay kutusu: [ ] Ticari elektronik ileti almayı kabul ediyorum.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Verilerin Yurtdışına Aktarımı</h2>
      <p className="mb-4">
        Kullanıcı verileriniz, sunucu hizmetleri veya üçüncü taraf servis sağlayıcılar aracılığıyla yurt dışına aktarılabilir.
        Onay kutusu: [ ] Verilerimin yurt dışındaki sunucularda işlenmesini ve saklanmasını kabul ediyorum.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Analiz ve Reklam Amaçlı Çerezler</h2>
      <p className="mb-4">
        Zorunlu olmayan analiz, performans ve reklam çerezleri, ancak açık rızanızla kullanılabilir.
        Onay kutusu: [ ] Çerez kullanım politikasını okudum ve analiz/reklam çerezlerinin kullanımına izin veriyorum.
      </p>

      <p className="mt-6">
        Bu metni okuyarak yukarıdaki konularda verdiğiniz açık rızalar, kayıt altına alınmakta ve talep halinde tarafınıza sunulmaktadır.
        Rızanızı her zaman kullanıcı ayarları veya <strong>emrecancnzytnl@gmail.com</strong> adresi üzerinden geri çekebilirsiniz.
      </p>
    </div>
  );
};

export default AcikRizaMetni;
