const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

async function sendConfirmationMail(email, name, date, start, end, token) {
  const cancelUrl = `https://besuchskalender.onrender.com/api/cancel?token=${token}`;

  const userMail = {
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Deine Besuchsbuchung",
    html: `
      <p>Hallo ${name},</p>
      <p>Deine Buchung am <strong>${date}</strong> von <strong>${start}</strong> bis <strong>${end}</strong> wurde gespeichert.</p>
      <p><a href="${cancelUrl}">Hier kannst du sie ggf. stornieren</a>.</p>
      <p>Viele Grüße,<br>Besuchskalender</p>
    `
  };

  const adminMail = {
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to: "eren.aykanat@web.de",
    subject: `Neue Buchung von ${name}`,
    html: `
      <p><strong>Vorname:</strong> ${name}</p>
      <p><strong>E-Mail:</strong> ${email}</p>
      <p><strong>Datum:</strong> ${date}</p>
      <p><strong>Uhrzeit:</strong> ${start} – ${end}</p>
    `
  };

  await transporter.sendMail(userMail);
  await transporter.sendMail(adminMail);
}

module.exports = { sendConfirmationMail };
