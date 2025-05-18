const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.example.com", // z. B. smtp.strato.de, smtp.mailgun.org ...
  port: 587,
  secure: false, // true bei Port 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

async function sendConfirmationMail(email, name, date, start, end, token) {
  const cancelUrl = `https://deine-seite.de/api/cancel?token=${token}`;
  const mailOptions = {
    from: '"Besuchskalender" <noreply@deine-seite.de>',
    to: email,
    subject: "Deine Buchung",
    html: `
      <p>Hallo ${name},</p>
      <p>Deine Buchung am <strong>${date}</strong> von <strong>${start}</strong> bis <strong>${end}</strong> wurde gespeichert.</p>
      <p><a href="${cancelUrl}">Hier kannst du sie ggf. stornieren</a>.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendConfirmationMail };
