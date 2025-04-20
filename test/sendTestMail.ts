// ✅ test/sendTestMail.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

async function sendTestMail() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    console.error("❌ .env ayarları eksik. GMAIL_USER ve GMAIL_APP_PASSWORD gerekli.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
    logger: true,
    debug: true,
  });

  const mailOptions = {
    from: gmailUser,
    to: gmailUser,
    subject: "📨 Undergo Mail Test Başarılı mı?",
    text: `Merhaba, bu sadece test amaçlı gönderilmiş bir e-postadır.\nTarih: ${new Date().toISOString()}`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Test maili başarıyla gönderildi:", result.response);
  } catch (error) {
    console.error("❌ Mail gönderimi başarısız:", error);
  }
}

sendTestMail();
