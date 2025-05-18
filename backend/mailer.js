const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "b0776fcbd0493d",
    pass: "bb193a4429e115" // ← dein echtes Passwort hier einfügen
  }
});

function sendConfirmationMail(email, name, date, start, end, token) {
  const cancelLink = `https://deineseite.onrender.com/cancel.html?token=${token}`;

  const mailOptions = {
    from: '"Besuchskalender" <noreply@besuch.local>',
    to: email,
    subject: "Bestätigung deines Besuchs",
    text: `Hallo ${name},\n
dein Besuch am ${date} von ${start} bis ${end} wurde erfolgreich eingetragen.\n
Wenn du absagen möchtest, kannst du deine Buchung hier stornieren:\n${cancelLink}\n\n
Viele Grüße\nDein Besuchs-Team`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Fehler beim Senden der Mail:", error);
    } else {
      console.log("Bestätigung gesendet:", info.response);
    }
  });
}

module.exports = { sendConfirmationMail };
