const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

async function sendConfirmationMail(email, name, date, start, end, token) {
  const cancelUrl = `https://besuchskalender.onrender.com/api/cancel?token=${token}`;
  const htmlBody = `
    <p>Hallo ${name},</p>
    <p>Deine Buchung am <strong>${date}</strong> von <strong>${start}</strong> bis <strong>${end}</strong> wurde gespeichert.</p>
    <p><a href="${cancelUrl}">Hier kannst du ggf. stornieren</a>.</p>
    <p>Liebe Grüße<br>Dein Besuchskalender</p>
  `;

  const mailOptionsUser = {
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Deine Besuchsbuchung",
    html: htmlBody,
  };

  const mailOptionsAdmin = {
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to: "eren.aykanat@web.de",
    subject: `📥 Neue Buchung von ${name}`,
    html: `
      <p><strong>Neue Buchung eingegangen</strong></p>
      <p><strong>Vorname:</strong> ${name}</p>
      <p><strong>Datum:</strong> ${date}</p>
      <p><strong>Uhrzeit:</strong> ${start} – ${end}</p>
      <p><strong>E-Mail:</strong> ${email}</p>
    `,
  };

  // Besucher & Admin benachrichtigen
  await transporter.sendMail(mailOptionsUser);
  await transporter.sendMail(mailOptionsAdmin);
}

module.exports = { sendConfirmationMail };
