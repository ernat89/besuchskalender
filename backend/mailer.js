const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "besuche.aykanat@gmail.com", // deine Gmail-Adresse
    pass: "mdjsyhztjmaiocbc" // App-Passwort, OHNE Leerzeichen
  }
});

async function sendConfirmationMail(email, name, date, start, end, token) {
  const link = `https://besuchskalender.onrender.com/api/cancel?token=${token}`;
  const html = `
    <p>Hallo ${name},</p>
    <p>dein Besuch am <strong>${date}</strong> von <strong>${start}</strong> bis <strong>${end}</strong> wurde gespeichert.</p>
    <p>Falls du den Besuch absagen möchtest, klicke hier:<br><a href="${link}">${link}</a></p>
    <p>Viele Grüße<br>Besuchskalender</p>
  `;

  await transporter.sendMail({
    from: '"Besuchskalender" <besuche.aykanat@gmail.com>',
    to: email,
    subject: "🗓️ Bestätigung deines Besuchs",
    html
  });
}

module.exports = { sendConfirmationMail };
