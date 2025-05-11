# 🌐 UnderGo

**UnderGo**, yabancı dil öğrenimini sosyal medya dinamikleriyle birleştiren, interaktif, kullanıcı odaklı bir platformdur.  
Kullanıcılar gönderi paylaşabilir, gönderilerdeki kelimeleri çevirerek puan toplayabilir, sıralamada yükselebilir ve arkadaşlarıyla iletişim kurabilir.

---

## 🚀 Özellikler

### 👥 Kullanıcı Paneli
- Hesap oluşturma ve JWT tabanlı güvenli giriş.
- Gönderi oluşturma (metin, görsel, video destekli).
- Kelime çevirisi yaparak puan kazanma.
- Seviye ve sıralama sistemi.
- Kullanıcı profili düzenleme, sosyal medya hesapları ekleme.
- DM (özel mesaj) sistemi ve geçmişi JSON olarak dışa aktarma.

### 🛡️ Moderasyon ve KVKK Uyumluluğu
- Yapay zeka destekli içerik kontrolü (AI uyarı geçmişi).
- Şikayet bildirimi ve içerik denetleme.
- KVKK/GDPR uyumlu veri silme ve dışa aktarma API’leri.
- Soft-delete ile arşivleme ve kayıtlı log sistemi.
- Cookie izin günlükleri ve gizlilik başvuru takip sistemi.

### 🛠️ Admin Paneli
- Kullanıcı, gönderi ve yorum görüntüleme ve silme.
- Şikayet edilen ve AI tarafından engellenen gönderiler listesi.
- Bekleyen gönderileri onaylama/reddetme.
- Arşivlenen gönderi/yorum/kullanıcıları PDF/CSV olarak dışa aktarma.
- Gizlilik başvurularını alma ve kullanıcıları silme.

---

## 🧰 Kullanılan Teknolojiler

| Teknoloji             | Açıklama                                         |
|-----------------------|--------------------------------------------------|
| **React**             | Kullanıcı arayüzü geliştirme                     |
| **Next.js (App Router)** | SSR ve yönlendirme yapısı                       |
| **TypeScript**        | Statik tip güvenliği                             |
| **Tailwind CSS**      | Hızlı ve responsive stil tasarımı                |
| **MySQL**             | Veritabanı yönetimi                              |
| **JWT + Cookies**     | HttpOnly cookie ile kimlik doğrulama             |
| **Node.js**           | Backend ve yardımcı script işlemleri             |
| **pdfkit**            | PDF oluşturma                                   |
| **json2csv**          | CSV formatında dışa aktarma                      |
| **ImageKit**          | Medya yükleme ve optimizasyon                    |
| **Nodemailer**        | SMTP e-posta gönderimi                           |

---

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

.env dosyasında olması gerekenler:

GEMINI_API_KEY=.......
DB_HOST=.......
DB_USER=.......
DB_PASS=.......
DB_NAME=.......
JWT_SECRET=.......
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=.......
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=.......
NEXT_PUBLIC_URL_ENDPOINT=.......
IMAGEKIT_PUBLIC_KEY=.......
IMAGEKIT_PRIVATE_KEY=.......
IMAGEKIT_URL_ENDPOINT=.......
GITHUB_CLIENT_ID=.......
GITHUB_CLIENT_SECRET=.......
NEXTAUTH_SECRET=.......
BASE_URL=.......
NEXTAUTH_URL=.......
EMAIL_PASSWORD=.......
GMAIL_USER=.......
GMAIL_APP_PASSWORD=.......
REPORT_EMAIL=.......
OPENAI_API_KEY=.......
S_API_USER=.......
S_API_SECRET=.......
NODE_ENV=.......
ADMIN_EMAIL=.......
NEXT_PUBLIC_DISABLE_CSP=.......




## 📸 Ekran Görüntüleri

Ana sayfa ve yönetim paneli:

(/images/1.png)  
(/images/2.png)  
(/images/3.png)  
(/images/4.png)  
(/images/5.png)  
(/images/6.png)



## 👨‍💻 Katkıda Bulunan

**Geliştirici:** Emrecan Zeytünlü  
📧 E-posta: emrecancnzytnl@gmail.com

---

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.  
Daha fazla bilgi için [LICENSE](./LICENSE) dosyasına göz atın.
