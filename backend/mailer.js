const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "besuche.aykanat@gmail.com",
    pass: "mdjsyhztjmaiocbc" // kein normales Passwort, nur App-Passwort!
  }
});

async function sendConfirmationMail(to, token) {
  const link = `https://besuchskalender.onrender.com/storno/${token}`;
  const mailOptions = {
    from: '"Besuchskalender" <besuche.aykanat@gmail.com>',
    to,
    subject: "Deine Buchung im Besuchskalender",
    html: `
      <p>✅ Danke für deine Buchung.</p>
      <p>Wenn du absagen willst, klick hier:</p>
      <a href="${link}">${link}</a>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Mail gesendet an:", to);
  } catch (err) {
    console.error("❌ Fehler beim Mailversand:", err);
  }
}

module.exports = { sendConfirmationMail };
