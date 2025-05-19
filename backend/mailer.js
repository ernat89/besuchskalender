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
  const mailOptions = {
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Deine Besuchsbuchung",
    html: `
      <p>Hallo ${name},</p>
      <p>Deine Buchung am <strong>${date}</strong> von <strong>${start}</strong> bis <strong>${end}</strong> wurde gespeichert.</p>
      <p><a href="${cancelUrl}">Buchung stornieren</a></p>
      <p>Liebe Grüße<br>Besuchskalender</p>
    `
  };

  await transporter.sendMail(mailOptions);

  // Admin-Benachrichtigung
  await transporter.sendMail({
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to: "eren.aykanat@web.de",
    subject: `Neue Buchung von ${name}`,
    html: `
      <p><strong>${name}</strong> hat einen Besuch gebucht.</p>
      <p><strong>Datum:</strong> ${date}<br>
      <strong>Uhrzeit:</strong> ${start} – ${end}</p>
    `
  });
}

module.exports = { sendConfirmationMail };
