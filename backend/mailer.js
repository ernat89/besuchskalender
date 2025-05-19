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
  
  // Bestätigung an Benutzer
  await transporter.sendMail({
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Deine Besuchsbuchung",
    html: `
      <p>Hallo ${name},</p>
      <p>Deine Buchung am <strong>${date}</strong> von <strong>${start}</strong> bis <strong>${end}</strong> wurde gespeichert.</p>
      <p>Falls du den Besuch stornieren möchtest, klicke hier:<br>
      <a href="${cancelUrl}">${cancelUrl}</a></p>
      <p>Liebe Grüße<br>Dein Besuchskalender</p>
    `
  });

  // Benachrichtigung an Admin
  await transporter.sendMail({
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to: "eren.aykanat@web.de",
    subject: `Neue Buchung von ${name}`,
    html: `
      <p>${name} hat einen Besuch gebucht.</p>
      <p><strong>Datum:</strong> ${date}<br>
      <strong>Uhrzeit:</strong> ${start} – ${end}<br>
      <strong>E-Mail:</strong> ${email}</p>
    `
  });
}

module.exports = { sendConfirmationMail };
