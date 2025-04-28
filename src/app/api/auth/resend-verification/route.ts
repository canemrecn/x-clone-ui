// src/app/api/auth/resend-verification/route.ts
//Bu dosya, kayıtlı bir kullanıcıya yeniden e-posta doğrulama kodu göndermek 
//için kullanılan bir API endpoint’idir (/api/auth/resend-verification); 
//gelen e-posta adresinin geçerliliğini kontrol eder, ardından 4 haneli 
//yeni bir doğrulama kodu üretir ve bu kodu Gmail ve Nodemailer kullanarak 
//belirtilen e-posta adresine gönderir. Kodun veritabanına kaydedilmesi 
//şu anda yorum satırına alınmıştır. Ortam değişkenlerinden e-posta 
//bilgileri alınır ve eksiklik durumunda hata döner. Başarılı işlem 
//sonunda "Doğrulama kodu gönderildi" mesajı ile yanıt verir.
// src/app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Basit email regex (temel kontrol)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail } = await req.json();

    // Email'in tanımlı olduğundan ve temizlendiğinden emin oluyoruz
    const email = rawEmail?.toString().trim();
    if (!email) {
      return NextResponse.json(
        { error: "Email gereklidir" },
        { status: 400 }
      );
    }
    // Email formatı kontrolü
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir email adresi giriniz" },
        { status: 400 }
      );
    }

    // 4 haneli rastgele doğrulama kodu oluşturma
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // (İsteğe bağlı) Eğer kullanıcı kayıtlıysa, DB'deki doğrulama kodunu güncelleyebilirsiniz.
    // const [users]: any = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    // if (users.length === 0) {
    //   return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    // }
    // await db.query("UPDATE users SET verification_code = ? WHERE email = ?", [verificationCode, email]);

    // Ortam değişkenlerinden e-posta ayarlarını alıyoruz
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      return NextResponse.json(
        { error: "E-posta ayarları eksik" },
        { status: 500 }
      );
    }

    // Nodemailer transporter'ı oluşturma (logger ve debug aktif)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Doğrulama e-postası içeriği
    const mailOptions = {
      from: gmailUser,
      to: email,
      subject: "Doğrulama Kodu",
      text: `Merhaba,

Hesabınızı doğrulamak için doğrulama kodunuz:

${verificationCode}

Teşekkürler.
      `,
    };

    // E-postayı gönderiyoruz; olası hataları yakalayıp logluyoruz.
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Doğrulama kodu gönderildi" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Resend Verification endpoint error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
