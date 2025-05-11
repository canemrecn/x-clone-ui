# 🌐 UnderGo

UnderGo, yabancı dil öğrenimini sosyal medya dinamikleriyle birleştiren, interaktif, kullanıcı odaklı bir platformdur. Kullanıcılar gönderi paylaşabilir, gönderilerdeki kelimeleri çevirerek puan toplayabilir, sıralamada yükselebilir ve arkadaşlarıyla iletişim kurabilir.

## 🚀 Özellikler

### 👥 Kullanıcı Paneli
- Hesap oluşturma ve JWT tabanlı güvenli giriş.
- Gönderi oluşturma (metin, resim, video).
- Kelime çevirisi yaparak puan kazanma.
- Seviye ve sıralama sistemi.
- Kullanıcı profili düzenleme ve sosyal medya hesapları ekleme.
- DM (özel mesaj) sistemi ve geçmiş dışa aktarma.

### 🛡️ Moderasyon ve KVKK Uyumluluğu
- Yapay zeka destekli gönderi analiz sistemi (AI uyarı geçmişi).
- Şikayet yönetim sistemi.
- KVKK/GDPR uyumlu veri silme ve dışa aktarma.
- Soft-delete sistemiyle verilerin arşivlenmesi.
- Cookie izin günlükleri ve gizlilik başvurusu paneli.

### 🛠️ Admin Paneli
- Kullanıcı, gönderi ve yorum yönetimi.
- Şikayet edilen gönderileri görüntüleme ve silme.
- Bekleyen gönderileri onaylama/reddetme.
- Silinen verileri arşivden PDF/CSV olarak dışa aktarma.
- Kullanıcı gizlilik taleplerini yönetme.

## 🧰 Kullanılan Teknolojiler

| Teknoloji        | Açıklama                                      |
|------------------|-----------------------------------------------|
| React            | Arayüz geliştirme                             |
| Next.js (App Router) | Sunucu ve istemci tarafı yönlendirme       |
| TypeScript       | Tip güvenliği                                 |
| Tailwind CSS     | Responsive ve hızlı arayüz tasarımı           |
| MySQL            | Veritabanı yönetimi                           |
| JWT              | Kimlik doğrulama (HttpOnly Cookie üzerinden) |
| Node.js          | Arka uç işlemleri                             |
| pdfkit           | PDF çıktıları oluşturmak için                 |
| json2csv         | CSV çıktıları oluşturmak için                 |
| ImageKit         | Medya yönetimi                                |
| Nodemailer       | SMTP ile e-posta gönderimi                    |
## 🗂️ Klasör Yapısı
src/
├── app/
│ ├── [username]/
│ ├── admin/
│ ├── api/
│ └── components/
├── lib/
├── styles/
scripts/
## ⚙️ Kurulum

```bash
# 1. Depoyu klonla
git clone https://github.com/kullaniciadi/undergo.git

# 2. Dizin içine gir
cd undergo

# 3. Bağımlılıkları yükle
npm install

# 4. Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasına DB ve SMTP bilgilerini gir

# 5. Veritabanını başlat
# (MySQL üzerinde tabloları oluştur)

# 6. Geliştirme sunucusunu başlat
npm run dev

.env dosyasında aşağıdaki değişkenlerin tanımlanması gerekir:
DATABASE_URL=mysql://user:pass@host/db
JWT_SECRET=...
GMAIL_USER=...
GMAIL_APP_PASSWORD=...
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...

## 📸 Ekran Görüntüleri

Ana sayfa görünümü:

(public/images/1.png)
(public/images/2.png)
(public/images/3.png)
(public/images/4.png)
(public/images/5.png)
(public/images/6.png)

👨‍💻 Katkıda Bulunan
Geliştirici: Emrecan Zeytünlü
Mail • emrecancnzytnl@gmail.com

## 📄 Lisans
Bu proje MIT lisansı ile lisanslanmıştır. Daha fazla bilgi için LICENSE dosyasına göz atın.


